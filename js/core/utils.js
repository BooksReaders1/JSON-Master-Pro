// 工具函数库
window.JSONUtils = {
    parse: function(str) {
        if (!str || typeof str !== 'string') return null;
        try {
            return JSON.parse(str);
        } catch (e) {
            return null;
        }
    },

    stringify: function(obj, space = 2) {
        try {
            return JSON.stringify(obj, null, space);
        } catch (e) {
            return null;
        }
    },

    isValid: function(str) {
        if (!str || typeof str !== 'string') return false;
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    },

    getDepth: function(obj, currentDepth = 0) {
        if (obj === null || typeof obj !== 'object') return currentDepth;
        if (Array.isArray(obj)) {
            return Math.max(...obj.map(item => this.getDepth(item, currentDepth + 1)), currentDepth + 1);
        }
        return Math.max(...Object.values(obj).map(v => this.getDepth(v, currentDepth + 1)), currentDepth + 1);
    },

    countKeys: function(obj) {
        if (obj === null || typeof obj !== 'object') return 0;
        let count = Array.isArray(obj) ? 0 : Object.keys(obj).length;
        const values = Array.isArray(obj) ? obj : Object.values(obj);
        for (const v of values) {
            if (v && typeof v === 'object') {
                count += this.countKeys(v);
            }
        }
        return count;
    },

    countNulls: function(obj) {
        if (obj === null) return 1;
        if (typeof obj !== 'object') return 0;
        let count = 0;
        const values = Array.isArray(obj) ? obj : Object.values(obj);
        for (const v of values) {
            count += this.countNulls(v);
        }
        return count;
    }
};
