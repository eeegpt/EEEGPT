const webpush = require('web-push');

const FIREBASE_DB_URL = 'https://innos-eee-world-default-rtdb.asia-southeast1.firebasedatabase.app';

function getAlertThresholdDays(freq) {
  if (freq === '1m') return 7;
  if (freq === '3m') return 14;
  if (freq === '6m') return 21;
  return 30;
}

function getBdTodayUtcMs() {
  const nowUtc = new Date();
  const bdNow = new Date(nowUtc.getTime() + 6 * 60 * 60 * 1000);
  return Date.UTC(bdNow.getUTCFullYear(), bdNow.getUTCMonth(), bdNow.getUTCDate());
}

function getDayLeft(expStr, bdTodayUtcMs) {
  if (!expStr) return null;
  const parts = String(expStr).split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const expUtc = Date.UTC(parts[0], parts[1] - 1, parts[2]);
  return Math.round((expUtc - bdTodayUtcMs) / 86400000);
}

module.exports = async function handler(req, res) {
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const contactEmail = process.env.VAPID_EMAIL || 'mailto:inno.eee@hotmail.com';

    if (!publicKey || !privateKey) {
      return res.status(500).json({ error: 'Missing VAPID keys in Vercel Environment Variables.' });
    }

    const testDeviceId = req.query && req.query.deviceId ? String(req.query.deviceId) : null;
    if (!testDeviceId && process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    webpush.setVapidDetails(contactEmail, publicKey, privateKey);

    const dbPath = testDeviceId
      ? `${FIREBASE_DB_URL}/audit_devices/${encodeURIComponent(testDeviceId)}.json`
      : `${FIREBASE_DB_URL}/audit_devices.json`;

    const fbRes = await fetch(dbPath);
    if (!fbRes.ok) {
      return res.status(502).json({ error: 'Failed to read Firebase database', status: fbRes.status });
    }

    const rawData = await fbRes.json();
    if (!rawData) {
      return res.status(200).json({ ok: true, checkedDevices: 0, notificationsSent: 0 });
    }

    const devices = testDeviceId ? { [testDeviceId]: rawData } : rawData;
    const bdTodayUtcMs = getBdTodayUtcMs();

    let checkedDevices = 0;
    let notificationsSent = 0;
    let expiredCleaned = 0;

    for (const [deviceId, deviceData] of Object.entries(devices)) {
      if (!deviceData || !deviceData.subscription || !Array.isArray(deviceData.reports)) {
        continue;
      }

      checkedDevices++;
      const dueReports = [];

      for (const report of deviceData.reports) {
        const dayLeft = getDayLeft(report.expDate, bdTodayUtcMs);
        if (dayLeft === null) continue;
        const threshold = getAlertThresholdDays(report.freq);
        if (dayLeft <= threshold) {
          dueReports.push({ name: report.name, dayLeft });
        }
      }

      if (dueReports.length === 0) continue;

      dueReports.sort((a, b) => a.dayLeft - b.dayLeft);
      const preview = dueReports
        .slice(0, 3)
        .map(r => r.dayLeft < 0 ? `${r.name} (Expired)` : `${r.name} (${r.dayLeft}d left)`)
        .join('\n');

      const payload = JSON.stringify({
        title: `EEEGPT Audit Alert (${dueReports.length} Due)`,
        body: preview,
        count: dueReports.length,
        url: './index.html#audit-reminder'
      });

      try {
        await webpush.sendNotification(deviceData.subscription, payload);
        notificationsSent++;
      } catch (pushErr) {
        if (pushErr && (pushErr.statusCode === 404 || pushErr.statusCode === 410)) {
          await fetch(`${FIREBASE_DB_URL}/audit_devices/${encodeURIComponent(deviceId)}/subscription.json`, {
            method: 'DELETE'
          });
          expiredCleaned++;
        } else {
          console.error('Push error for', deviceId, pushErr && pushErr.message);
        }
      }
    }

    return res.status(200).json({
      ok: true,
      checkedDevices,
      notificationsSent,
      expiredCleaned
    });
  } catch (err) {
    console.error('Cron audit error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};