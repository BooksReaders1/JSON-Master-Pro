(function() {
    const BeanModule = {
        name: 'Java Bean',
        icon: 'fa-file-code',
        init: (container) => {
            container.innerHTML = `
                <div class="split-pane">
                    <div><textarea id="bean-input" class="editor-box w-full h-full resize-none" placeholder="粘贴 JSON..."></textarea></div>
                    <div><textarea id="bean-output" class="editor-box w-full h-full resize-none" readonly></textarea></div>
                </div>
                <div class="mt-4"><button id="bean-run" class="btn-primary"><i class="fas fa-play"></i> 生成 Java Bean</button></div>
            `;
            
            const runBtn = container.querySelector('#bean-run');
            const inputEl = container.querySelector('#bean-input');
            const outputEl = container.querySelector('#bean-output');
            
            runBtn.onclick = () => {
                const input = inputEl.value;
                const res = safeJsonParse(input);
                if(res.error) { showToast(res.error, 'error'); return; }
                const code = generateBean(res.data, 'Root');
                outputEl.value = code;
                showToast('生成成功', 'success');
            };
        },
        activate: (globalInput) => {
            const el = document.getElementById('bean-input');
            if(el && !el.value && globalInput) { el.value = globalInput; document.getElementById('bean-run').click(); }
        },
        deactivate: () => {}
    };
    function generateBean(data, name) {
        if(typeof data !== 'object' || data === null || Array.isArray(data)) return '';
        let code = '@Data\n@Builder\n@NoArgsConstructor\n@AllArgsConstructor\npublic class ' + name + ' {\n';
        const classes = [];
        for(const [k,v] of Object.entries(data)) {
            const type = getJavaType(v, k, classes);
            const field = toCamel(k);
            code += '    private ' + type + ' ' + field + ';\n';
        }
        code += '}\n';
        classes.forEach(c => code += '\n' + c);
        return code;
    }
    function getJavaType(v, key, classes) {
        if(v === null) return 'Object';
        if(typeof v === 'boolean') return 'Boolean';
        if(typeof v === 'number') return Number.isInteger(v) ? 'Integer' : 'Double';
        if(typeof v === 'string') return 'String';
        if(Array.isArray(v)) return 'List<Object>';
        if(typeof v === 'object') {
            const clsName = toPascal(key);
            classes.push(generateBean(v, clsName));
            return clsName;
        }
        return 'Object';
    }
    function toCamel(s) { return s.replace(/_([a-z])/g, g => g[1].toUpperCase()); }
    function toPascal(s) { return s.charAt(0).toUpperCase() + s.slice(1).replace(/_([a-z])/g, g => g[1].toUpperCase()); }
    if(window.AppInstance) window.AppInstance.register('bean', BeanModule);
})();
