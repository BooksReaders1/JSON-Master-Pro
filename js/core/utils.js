// 工具函数
window.Utils = {
    parseJSON: function(str) {
        if (!str || typeof str !== 'string') return { success: false, data: null, error: '输入为空' };
        try {
            const data = JSON.parse(str);
            return { success: true, data, error: null };
        } catch (e) {
            return { success: false, data: null, error: e.message };
        }
    },
    
    copyToClipboard: function(text) {
        if (!text) return false;
        navigator.clipboard.writeText(text).then(() => {
            showToast('已复制到剪贴板', 'success');
        }).catch(() => {
            showToast('复制失败', 'error');
        });
        return true;
    },
    
    formatBytes: function(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};
