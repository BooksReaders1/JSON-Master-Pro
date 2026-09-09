(function() {
    const QueryModule = {
        name: '查询过滤',
        icon: 'fa-filter',
        init: (container) => {
            container.innerHTML = `
                <div class="flex flex-col h-full gap-2">
                    <div class="flex gap-2 mb-2">
                        <select id="query-lang" class="editor-box px-3 py-1"><option value="jsonpath">JSONPath</option><option value="jmespath">JMESPath</option></select>
                        <input type="text" id="query-expr" placeholder="$.store.book[*].author" class="editor-box flex-1 px-3 py-1"/>
                        <button id="query-run" class="btn-primary"><i class="fas fa-play"></i> 执行</button>
                    </div>
                    <textarea id="query-output" class="editor-box flex-1 resize-none" readonly></textarea>
                </div>
            `;
            
            const runBtn = container.querySelector('#query-run');
            const langEl = container.querySelector('#query-lang');
            const exprEl = container.querySelector('#query-expr');
            const outputEl = container.querySelector('#query-output');
            
            runBtn.onclick = () => {
                const lang = langEl.value;
                const expr = exprEl.value;
                const inputData = window.AppInstance.globalInput;
                const res = safeJsonParse(inputData);
                if(res.error) { showToast(res.error, 'error'); return; }
                try {
                    let result;
                    if(lang === 'jsonpath') {
                        result = JSONPath({path: expr, json: res.data});
                    } else {
                        result = jmespath.search(res.data, expr);
                    }
                    outputEl.value = JSON.stringify(result, null, 2);
                    showToast('查询成功', 'success');
                } catch(e) { showToast(e.message, 'error'); }
            };
        },
        activate: () => {},
        deactivate: () => {}
    };
    if(window.AppInstance) window.AppInstance.register('query', QueryModule);
})();
