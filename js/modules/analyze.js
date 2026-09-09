(function() {
    const AnalyzeModule = {
        name: '性能分析',
        icon: 'fa-chart-bar',
        init: (container) => {
            container.innerHTML = `
                <div class="flex flex-col h-full gap-4">
                    <div class="grid grid-cols-4 gap-4">
                        <div class="card bg-[#252526] p-4 rounded"><div class="text-xs text-gray-400">大小</div><div id="ana-size" class="text-xl font-bold">-</div></div>
                        <div class="card bg-[#252526] p-4 rounded"><div class="text-xs text-gray-400">键值对</div><div id="ana-count" class="text-xl font-bold">-</div></div>
                        <div class="card bg-[#252526] p-4 rounded"><div class="text-xs text-gray-400">最大深度</div><div id="ana-depth" class="text-xl font-bold">-</div></div>
                        <div class="card bg-[#252526] p-4 rounded"><div class="text-xs text-gray-400">Null 值</div><div id="ana-null" class="text-xl font-bold">-</div></div>
                    </div>
                    <div class="card bg-[#252526] p-4 rounded flex-1 overflow-auto">
                        <h4 class="font-bold mb-2">类型分布</h4>
                        <div id="ana-types" class="space-y-2"></div>
                    </div>
                </div>
            `;
        },
        activate: (globalInput) => {
            if(!globalInput.trim()) return;
            const res = safeJsonParse(globalInput);
            if(res.error) { document.getElementById('ana-size').textContent = 'Invalid JSON'; return; }
            const size = new Blob([globalInput]).size;
            document.getElementById('ana-size').textContent = size > 1024*1024 ? (size/1024/1024).toFixed(2)+'MB' : size > 1024 ? (size/1024).toFixed(2)+'KB' : size+'B';
            const stats = analyzeStats(res.data);
            document.getElementById('ana-count').textContent = stats.count;
            document.getElementById('ana-depth').textContent = stats.depth;
            document.getElementById('ana-null').textContent = stats.nulls;
            const typesEl = document.getElementById('ana-types');
            typesEl.innerHTML = '';
            for(const [t,c] of Object.entries(stats.types)) {
                typesEl.innerHTML += '<div class="flex justify-between text-sm"><span>'+t+'</span><span class="text-gray-400">'+c+'</span></div>';
            }
        },
        deactivate: () => {}
    };
    function analyzeStats(data) {
        let count=0, depth=0, nulls=0, types={};
        function walk(d, dpt) {
            if(d===null){nulls++; types['null']=(types['null']||0)+1; return;}
            if(Array.isArray(d)){types['array']=(types['array']||0)+1; d.forEach(x=>walk(x,dpt+1));}
            else if(typeof d==='object'){count+=Object.keys(d).length; types['object']=(types['object']||0)+1; Object.values(d).forEach(v=>walk(v,dpt+1));}
            else{types[typeof d]=(types[typeof d]||0)+1;}
            if(dpt>depth) depth=dpt;
        }
        walk(data, 1);
        return {count, depth, nulls, types};
    }
    if(window.AppInstance) window.AppInstance.register('analyze', AnalyzeModule);
})();
