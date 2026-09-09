// JSON ⇄ Java Map Module
const JavaModule = {
    inputEl: null,
    outputEl: null,

    init() {
        this.inputEl = document.getElementById('javaInput');
        this.outputEl = document.getElementById('javaOutput');
        console.log('[JavaModule] Initialized');
    },

    onActivate() {
        const mainInput = document.getElementById('inputJson');
        if (mainInput && mainInput.value.trim()) {
            this.inputEl.value = mainInput.value;
        }
    },

    onSync(data) {
        this.inputEl.value = data;
        if (document.getElementById('viewJava').classList.contains('hidden') === false) {
            this.doJavaConvert();
        }
    },

    doJavaConvert() {
        const input = this.inputEl.value.trim();
        if (!input) {
            this.outputEl.value = '';
            return;
        }

        try {
            const obj = JSON.parse(input);
            const result = this.convertToJavaMap(obj, 0);
            this.outputEl.value = result;
            showToast('转换完成：JSON → Java Map', 'success');
        } catch (e) {
            showToast('JSON 解析错误：' + e.message, 'error');
            this.outputEl.value = '';
        }
    },

    convertToJavaMap(obj, indent) {
        const spaces = ' '.repeat(indent * 4);
        const nextSpaces = ' '.repeat((indent + 1) * 4);

        if (obj === null) {
            return 'null';
        }

        if (Array.isArray(obj)) {
            if (obj.length === 0) {
                return 'new ArrayList<>()';
            }
            
            let result = 'new ArrayList<>(Arrays.asList(\n' + nextSpaces;
            const items = obj.map(item => this.convertToJavaMap(item, indent + 1));
            result += items.join(',\n' + nextSpaces);
            result += '\n' + spaces + '))';
            return result;
        }

        if (typeof obj === 'object') {
            const keys = Object.keys(obj);
            if (keys.length === 0) {
                return 'new HashMap<>()';
            }

            let result = 'new HashMap<>() {{\n';
            keys.forEach(key => {
                const value = obj[key];
                const javaKey = key.includes(' ') || key.includes('-') ? `"${key}"` : `"${key}"`;
                const javaValue = this.convertToJavaMap(value, indent + 1);
                result += nextSpaces + `put(${javaKey}, ${javaValue});\n`;
            });
            result += spaces + '}}';
            return result;
        }

        if (typeof obj === 'string') {
            return `"${obj.replace(/"/g, '\\"')}"`;
        }

        if (typeof obj === 'boolean') {
            return obj.toString();
        }

        if (typeof obj === 'number') {
            if (Number.isInteger(obj)) {
                return String(obj);
            }
            // Check if it's a large number that should be BigDecimal
            if (String(obj).includes('e') || String(obj).length > 15) {
                return `new BigDecimal("${obj}")`;
            }
            return String(obj);
        }

        return String(obj);
    },

    getContentForCopy() {
        return this.outputEl?.value || '';
    }
};

App.registerModule('java', JavaModule);
window.doJavaConvert = () => JavaModule.doJavaConvert();
