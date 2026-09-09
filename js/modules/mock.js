(function() {
    const MockModule = {
        name: 'Mock 数据',
        icon: 'fa-wand-magic-sparkles',
        init: (container) => {
            container.innerHTML = `
                <div class="split-pane">
                    <div>
                        <label class="text-xs text-gray-400 mb-2 block">配置 (支持 @name, @email, @phone 等)</label>
                        <textarea id="mock-config" class="editor-box w-full h-full resize-none" placeholder='{"count": 5, "template": {"name": "@name", "email": "@email"}}'></textarea>
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 mb-2 block">结果</label>
                        <textarea id="mock-output" class="editor-box w-full h-full resize-none" readonly></textarea>
                    </div>
                </div>
                <div class="mt-4"><button id="mock-run" class="btn-primary"><i class="fas fa-play"></i> 生成 Mock 数据</button></div>
            `;
            document.getElementById('mock-run').onclick = () => {
                const configStr = document.getElementById('mock-config').value;
                const res = safeJsonParse(configStr);
                if(res.error) { showToast(res.error, 'error'); return; }
                const cfg = res.data;
                const count = cfg.count || 5;
                const template = cfg.template || {};
                const result = [];
                for(let i=0; i<count; i++) {
                    const item = {};
                    for(const [k,v] of Object.entries(template)) {
                        item[k] = parseMockValue(v);
                    }
                    result.push(item);
                }
                document.getElementById('mock-output').value = JSON.stringify(result, null, 2);
                showToast('生成成功', 'success');
            };
        },
        activate: () => {},
        deactivate: () => {}
    };
    function parseMockValue(v) {
        if(typeof v === 'string' && v.startsWith('@')) {
            const fn = v.slice(1);
            if(fn === 'name') return faker.person.fullName();
            if(fn === 'email') return faker.internet.email();
            if(fn === 'phone') return faker.phone.number();
            if(fn === 'city') return faker.location.city();
            if(fn === 'uuid') return faker.string.uuid();
            return faker.helpers.arrayElement(['foo','bar','baz']);
        }
        return v;
    }
    if(window.AppInstance) window.AppInstance.register('mock', MockModule);
})();
