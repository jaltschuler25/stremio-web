/**
 * Parses raw Torrentio stream data into structured torrent metadata.
 * Extracts seeders, file size, quality, and a cleaned-up release title
 * from the addon-provided name/description strings.
 */

const QUALITY_MAP = {
    '2160p': '4K',
    '1080p': '1080p',
    '720p': '720p',
    '480p': '480p',
};

const QUALITY_PATTERN = /\b(2160p|1080p|720p|480p)\b/i;
const SEEDERS_PATTERN = /👤\s*(\d+)/;
const SIZE_PATTERN = /💾\s*([\d.]+\s*[GMKT]B)/i;
const BRACKET_TAG_PATTERN = /\[[\w+]+\]\s*/g;
const GEAR_SUFFIX_PATTERN = /⚙️\s*\w+/g;

function parseTorrentInfo(name, description) {
    if (!description && !name) return null;

    const fullText = [name, description].filter(Boolean).join('\n');

    const seedersMatch = fullText.match(SEEDERS_PATTERN);
    const sizeMatch = fullText.match(SIZE_PATTERN);
    const qualityMatch = fullText.match(QUALITY_PATTERN);

    const seeders = seedersMatch ? parseInt(seedersMatch[1], 10) : null;
    const size = sizeMatch ? sizeMatch[1].trim() : null;
    const quality = qualityMatch ? (QUALITY_MAP[qualityMatch[1]] || qualityMatch[1]) : null;

    const lines = (description || '').split('\n');
    let releaseLine = lines.length > 1 ? lines[lines.length - 1] : lines[0] || '';

    releaseLine = releaseLine
        .replace(BRACKET_TAG_PATTERN, '')
        .replace(GEAR_SUFFIX_PATTERN, '')
        .replace(SEEDERS_PATTERN, '')
        .replace(SIZE_PATTERN, '')
        .trim();

    const title = releaseLine
        .replace(/\./g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();

    return { title, quality, size, seeders };
}

module.exports = parseTorrentInfo;
