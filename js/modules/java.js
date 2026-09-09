// Java Map 模块
(function() {
    const JavaModule = {
        name: 'Java Map',
        icon: 'fa-coffee',
        
        init: function(container) {
            container.innerHTML = `
                <div class="flex flex-col h-full gap-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-white">JSON → Java Map</h3>
                        <button id="java-run" class="btn-primary"><i class="fas fa-play"></i> 生成代码</button>
                    </div>
                    <textarea id="java-output" class="editor-box flex-1" readonly placeholder="生成的 Java Map 代码"></textarea>
                </div>
            `;

            document.getElementById('java-run').onclick = () => this.generate();
        },

        activate: function(input) {
            this.input = input;
        },

        generate: function() {
            const parsed = JSONUtils.parse(this.input);
            if (parsed === null) {
                showToast('无效的 JSON', 'error');
                return;
            }

            const code = this.convertToMap(parsed, 0);
            document.getElementById('java-output').value = code;
            showToast('生成成功', 'success');
        },

        convertToMap: function(obj, indent) {
            const pad = '  '.repeat(indent);
            
            if (obj === null) return 'null';
            if (typeof obj === 'boolean') return String(obj);
            if (typeof obj === 'number') {
                if (Number.isInteger(obj) && Math.abs(obj) <= Number.MAX_SAFE_INTEGER) {
                    return String(obj);
                }
                return `new java.math.BigDecimal("${obj}")`;
            }
            if (typeof obj === 'string') {
                return `"${obj.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
            }

            if (Array.isArray(obj)) {
                if (obj.length === 0) return 'new java.util.ArrayList<>()';
                const items = obj.map(item => this.convertToMap(item, indent + 1)).join(',\n' + pad + '  ');
                return `new java.util.ArrayList<>() {{\n${pad}  ${items.split('\n').join('\n' + pad + '  ')}\n${pad}}}`;
            }

            const keys = Object.keys(obj);
            if (keys.length === 0) return 'new java.util.HashMap<>()';
            
            const entries = keys.map(key => {
                const value = this.convertToMap(obj[key], indent + 1);
                return `${pad}  put("${key}", ${value});`;
            }).join('\n');

            return `new java.util.HashMap<>() {{\n${entries}\n${pad}}}`;
        }
    };

    if (window.AppInstance) {
        window.AppInstance.register('java', JavaModule);
    }
})();
