function safeJsonParse(str) {
    try {
        return { data: JSON.parse(str), error: null };
    } catch (e) {
        return { data: null, error: e.message };
    }
}

function formatJson(str, indent = 2) {
    const result = safeJsonParse(str);
    if (result.error) return null;
    return JSON.stringify(result.data, null, indent);
}

function minifyJson(str) {
    const result = safeJsonParse(str);
    if (result.error) return null;
    return JSON.stringify(result.data);
}

window.safeJsonParse = safeJsonParse;
window.formatJson = formatJson;
window.minifyJson = minifyJson;
