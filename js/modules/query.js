/**
 * JSON 查询与过滤模块
 * 支持 JSONPath 和 JMESPath 查询语法
 */

const QueryModule = {
    elements: {},
    currentMode: 'jsonpath',
    
    init(els) {
        this.elements = {
            input: document.getElementById('queryInput'),
            expression: document.getElementById('queryExpression'),
            output: document.getElementById('queryOutput'),
            stats: document.getElementById('queryStats'),
            modeSelect: document.getElementById('queryMode')
        };
        
        // Setup mode switcher
        if (this.elements.modeSelect) {
            this.elements.modeSelect.addEventListener('change', (e) => {
                this.currentMode = e.target.value;
                this.insertExample();
            });
        }
        
        console.log('[QueryModule] Initialized');
    },
    
    doQuery() {
        const inputVal = this.elements.input.value.trim();
        const expr = this.elements.expression.value.trim();
        
        if (!inputVal) {
            showToast('请输入 JSON 数据', 'warning');
            return;
        }
        
        if (!expr) {
            showToast('请输入查询表达式', 'warning');
            return;
        }
        
        App.withLoading('执行查询中...', () => {
            try {
                const data = JSON.parse(inputVal);
                let result;
                
                if (this.currentMode === 'jsonpath') {
                    // Use JSONPath
                    const JSONPath = window.JSONPath || (window.jsonpath && window.jsonpath.JSONPath);
                    if (!JSONPath) {
                        throw new Error('JSONPath 库未加载');
                    }
                    result = JSONPath({ path: expr, json: data });
                } else {
                    // Use JMESPath
                    const jmespath = window.jmespath;
                    if (!jmespath) {
                        throw new Error('JMESPath 库未加载');
                    }
                    result = jmespath.search(data, expr);
                }
                
                // Format result
                const formatted = typeof result === 'string' 
                    ? result 
                    : JSON.stringify(result, null, 4);
                
                this.elements.output.value = formatted;
                
                // Update stats
                const resultType = Array.isArray(result) ? 'array' : typeof result;
                const itemCount = Array.isArray(result) ? result.length : 1;
                this.elements.stats.innerHTML = `
                    <span class="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 rounded text-[10px] text-slate-300">
                        <i class="fa-solid fa-code"></i> ${resultType}
                    </span>
                    <span class="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 rounded text-[10px] text-slate-300">
                        <i class="fa-solid fa-list"></i> ${itemCount} 项
                    </span>
                `;
                
                showToast('查询成功', 'success');
            } catch (e) {
                this.elements.output.value = '';
                this.elements.stats.innerHTML = '';
                showToast(`${this.currentMode.toUpperCase()} 查询错误：${e.message}`, 'error');
            }
        });
    },
    
    insertExample() {
        const examples = {
            jsonpath: [
                '$.store.book[*].author',
                '$..book[2]',
                '$..book[?(@.price<10)]',
                '$..book[?(@.category==\'fiction\')]'
            ],
            jmespath: [
                'people[*].name',
                'people[0].age',
                'people[?age > `30`].name',
                'reverse(sort_by(people, &age))'
            ]
        };
        
        const currentExamples = examples[this.currentMode] || [];
        const example = currentExamples[Math.floor(Math.random() * currentExamples.length)];
        this.elements.expression.value = example;
        showToast(`已插入${this.currentMode.toUpperCase()}示例`, 'info');
    },
    
    loadSample() {
        const sample = {
            "store": {
                "book": [
                    {"category": "reference", "author": "Nigel Rees", "title": "Sayings of the Century", "price": 8.95},
                    {"category": "fiction", "author": "Evelyn Waugh", "title": "Sword of Honour", "price": 12.99},
                    {"category": "fiction", "author": "Herman Melville", "title": "Moby Dick", "isbn": "0-553-21311-3", "price": 8.99},
                    {"category": "fiction", "author": "J. R. R. Tolkien", "title": "The Lord of the Rings", "isbn": "0-395-19395-8", "price": 22.99}
                ],
                "bicycle": {"color": "red", "price": 19.95}
            },
            "expensive": 10
        };
        
        this.elements.input.value = JSON.stringify(sample, null, 4);
        showToast('已加载示例数据', 'info');
    },
    
    getContentForCopy() {
        return this.elements.output?.value || '';
    },
    
    onActivate() {
        // Focus expression input
        if (this.elements.expression) {
            this.elements.expression.focus();
        }
    },
    
    onSync(value) {
        if (this.elements.input) {
            this.elements.input.value = value;
        }
    }
};

// Register module
App.registerModule('query', QueryModule);

// Global functions
window.doQuery = () => QueryModule.doQuery();
window.insertQueryExample = () => QueryModule.insertExample();
window.loadQuerySample = () => QueryModule.loadSample();
