(function() {
    const JavaModule = {
        name: 'Java Map',
        icon: 'fa-coffee',
        init: (container) => {
            container.innerHTML = `
                <div class="split-pane">
                    <div><textarea id="java-input" class="editor-box w-full h-full resize-none" placeholder="粘贴 JSON..."></textarea></div>
                    <div><textarea id="java-output" class="editor-box w-full h-full resize-none" readonly></textarea></div>
                </div>
                <div class="mt-4"><button id="java-run" class="btn-primary"><i class="fas fa-play"></i> 生成 Java Map</button></div>
            `;
            
            const runBtn = container.querySelector('#java-run');
            const inputEl = container.querySelector('#java-input');
            const outputEl = container.querySelector('#java-output');
            
            runBtn.onclick = () => {
                const input = inputEl.value;
                const res = safeJsonParse(input);
                if(res.error) { showToast(res.error, 'error'); return; }
                const code = toJsonMap(res.data);
                outputEl.value = code;
                showToast('生成成功', 'success');
            };
        },
        activate: (globalInput) => {
            const el = document.getElementById('java-input');
            if(el && !el.value && globalInput) { el.value = globalInput; document.getElementById('java-run').click(); }
        },
        deactivate: () => {}
    };
    function toJsonMap(data) {
        if(data === null) return 'null';
        if(typeof data === 'boolean' || typeof data === 'number') return String(data);
        if(typeof data === 'string') return '"' + data.replace(/"/g, '\\"') + '"';
        if(Array.isArray(data)) return 'new ArrayList<>(){{' + data.map(v => 'add(' + toJsonMap(v) + ');').join('') + '}}';
        let s = 'new HashMap<>(){{';
        for(const [k,v] of Object.entries(data)) s += 'put("' + k + '", ' + toJsonMap(v) + ');';
        return s + '}}';
    }
    if(window.AppInstance) window.AppInstance.register('java', JavaModule);
})();
