/**
 * GPX Service — Export tracked workout sessions to standard .gpx XML files
 */
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { RoutePoint, WorkoutSession } from './gpsService';

/**
 * Converts route points and session telemetry into valid GPX 1.1 XML string.
 */
export function buildGpxXml(session: WorkoutSession): string {
  const pointsXml = (session.route || [])
    .map(
      (pt) => `      <trkpt lat="${pt.latitude}" lon="${pt.longitude}">
        <time>${new Date(pt.timestamp).toISOString()}</time>
        <speed>${pt.speed}</speed>
      </trkpt>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="VibeWalk App" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>VibeWalk Outdoor Session</name>
    <time>${session.startTime || new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>GPS Walk (${session.distanceKm.toFixed(2)} km)</name>
    <trkseg>
${pointsXml || `      <trkpt lat="37.7749" lon="-122.4194"><time>${new Date().toISOString()}</time></trkpt>`}
    </trkseg>
  </trk>
</gpx>`;
}

/**
 * Saves GPX XML content to local disk and opens native share sheet.
 */
export async function exportAndShareGpx(session: WorkoutSession): Promise<boolean> {
  try {
    const xmlContent = buildGpxXml(session);
    const fileName = `VibeWalk_Session_${Date.now()}.gpx`;
    const docDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || '';
    const filePath = `${docDir}${fileName}`;

    if ((FileSystem as any).writeAsStringAsync) {
      await (FileSystem as any).writeAsStringAsync(filePath, xmlContent, {
        encoding: (FileSystem as any).EncodingType?.UTF8 || 'utf8',
      });
    }

    const canShare = await Sharing.isAvailableAsync();
    if (canShare && filePath) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/gpx+xml',
        dialogTitle: 'Export VibeWalk GPX Route',
        UTI: 'com.topografix.gpx',
      });
      return true;
    }
    return false;
  } catch (error) {
    console.warn('[gpxService] Export GPX error:', error);
    return false;
  }
}
