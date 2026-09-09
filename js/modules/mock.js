/**
 * Mock 数据生成模块
 * 根据 JSON 结构或 Java Bean 生成 Mock 数据
 */

const MockModule = {
    elements: {},
    
    init(els) {
        this.elements = {
            input: document.getElementById('mockInput'),
            output: document.getElementById('mockOutput'),
            count: document.getElementById('mockCount'),
            useFaker: document.getElementById('mockUseFaker'),
            generateBtn: document.querySelector('#viewMock button[onclick="doGenerateMock()"]')
        };
        
        console.log('[MockModule] Initialized');
    },
    
    doGenerate() {
        const input = this.elements.input.value.trim();
        const count = parseInt(this.elements.count?.value || '1', 10);
        const useFaker = this.elements.useFaker?.checked ?? true;
        
        if (!input) {
            showToast('请输入 JSON 模板或 Java Bean 代码', 'warning');
            return;
        }
        
        App.withLoading('生成 Mock 数据中...', () => {
            try {
                let template;
                let isArray = false;
                
                // Try to detect if it's Java Bean code
                if (input.includes('class ') && input.includes('{')) {
                    template = this.parseJavaBean(input);
                } else {
                    template = JSON.parse(input);
                    if (Array.isArray(template)) {
                        isArray = true;
                        template = template[0] || {};
                    }
                }
                
                let results = [];
                for (let i = 0; i < count; i++) {
                    results.push(this.generateFromTemplate(template, useFaker));
                }
                
                // If original was array with multiple items or count > 1, return array
                if (isArray || count > 1) {
                    this.elements.output.value = JSON.stringify(results, null, 4);
                } else {
                    this.elements.output.value = JSON.stringify(results[0], null, 4);
                }
                
                showToast(`成功生成 ${count} 条 Mock 数据`, 'success');
            } catch (e) {
                showToast('生成失败：' + e.message, 'error');
                this.elements.output.value = '';
            }
        });
    },
    
    parseJavaBean(code) {
        const template = {};
        const lines = code.split('\n');
        
        for (const line of lines) {
            // Match field declarations like: private String name; or private Integer age;
            const match = line.match(/private\s+(?:final\s+)?(\w+)\s+(\w+)\s*;/);
            if (match) {
                const [, type, name] = match;
                template[name] = this.getDefaultValueForType(type);
            }
        }
        
        return template;
    },
    
    getDefaultValueForType(type) {
        const faker = window.faker;
        
        switch(type) {
            case 'String':
                return faker ? faker.lorem.word() : 'string';
            case 'Integer':
            case 'int':
            case 'Long':
            case 'long':
                return faker ? faker.number.int({ min: 1, max: 1000 }) : 0;
            case 'Double':
            case 'double':
            case 'Float':
            case 'float':
            case 'BigDecimal':
                return faker ? faker.number.float({ min: 0, max: 100, fractionDigits: 2 }) : 0.0;
            case 'Boolean':
            case 'boolean':
                return faker ? faker.datatype.boolean() : false;
            case 'Date':
            case 'LocalDate':
            case 'LocalDateTime':
                return faker ? faker.date.recent().toISOString() : new Date().toISOString();
            default:
                return null;
        }
    },
    
    generateFromTemplate(template, useFaker) {
        const result = {};
        const faker = window.faker;
        
        for (const [key, value] of Object.entries(template)) {
            if (value === null) {
                result[key] = null;
            } else if (typeof value === 'string') {
                result[key] = this.generateStringValue(key, useFaker, faker);
            } else if (typeof value === 'number') {
                result[key] = useFaker && faker 
                    ? faker.number.int({ min: 1, max: 10000 }) 
                    : Math.floor(Math.random() * 1000);
            } else if (typeof value === 'boolean') {
                result[key] = useFaker && faker ? faker.datatype.boolean() : Math.random() > 0.5;
            } else if (Array.isArray(value)) {
                result[key] = this.generateArray(key, value, useFaker, faker);
            } else if (typeof value === 'object') {
                result[key] = this.generateFromTemplate(value, useFaker);
            }
        }
        
        return result;
    },
    
    generateStringValue(key, useFaker, faker) {
        if (!useFaker || !faker) {
            return key.toLowerCase();
        }
        
        const keyLower = key.toLowerCase();
        
        // Smart field detection
        if (keyLower.includes('email')) return faker.internet.email();
        if (keyLower.includes('phone') || keyLower.includes('mobile')) return faker.phone.number();
        if (keyLower.includes('name') || keyLower.includes('username')) return faker.person.fullName();
        if (keyLower.includes('firstname') || keyLower.includes('givenname')) return faker.person.firstName();
        if (keyLower.includes('lastname') || keyLower.includes('surname')) return faker.person.lastName();
        if (keyLower.includes('address') || keyLower.includes('street')) return faker.location.streetAddress();
        if (keyLower.includes('city')) return faker.location.city();
        if (keyLower.includes('country')) return faker.location.country();
        if (keyLower.includes('zip') || keyLower.includes('postal')) return faker.location.zipCode();
        if (keyLower.includes('url') || keyLower.includes('website')) return faker.internet.url();
        if (keyLower.includes('company') || keyLower.includes('organization')) return faker.company.name();
        if (keyLower.includes('title') || keyLower.includes('job')) return faker.person.jobTitle();
        if (keyLower.includes('description') || keyLower.includes('desc')) return faker.lorem.sentence();
        if (keyLower.includes('color')) return faker.color.human();
        if (keyLower.includes('uuid') || keyLower.includes('id') && key.length > 3) return faker.string.uuid();
        
        return faker.lorem.word();
    },
    
    generateArray(key, template, useFaker, faker) {
        if (template.length === 0) return [];
        
        const itemTemplate = template[0];
        const arraySize = faker ? faker.number.int({ min: 3, max: 10 }) : 5;
        const result = [];
        
        for (let i = 0; i < arraySize; i++) {
            if (typeof itemTemplate === 'object' && itemTemplate !== null) {
                result.push(this.generateFromTemplate(itemTemplate, useFaker));
            } else {
                result.push(itemTemplate);
            }
        }
        
        return result;
    },
    
    loadSample() {
        const sample = {
            id: 0,
            username: '',
            email: '',
            phone: '',
            address: {
                street: '',
                city: '',
                zipCode: ''
            },
            company: '',
            isActive: true,
            score: 0,
            createdAt: '',
            tags: ['sample']
        };
        
        this.elements.input.value = JSON.stringify(sample, null, 4);
        showToast('已加载示例模板', 'info');
    },
    
    getContentForCopy() {
        return this.elements.output?.value || '';
    },
    
    onActivate() {
        // Auto-generate if input exists
        if (this.elements.input?.value.trim()) {
            this.doGenerate();
        }
    },
    
    onSync(value) {
        if (this.elements.input) {
            this.elements.input.value = value;
        }
    }
};

// Register module
App.registerModule('mock', MockModule);

// Global functions
window.doGenerateMock = () => MockModule.doGenerate();
window.loadMockSample = () => MockModule.loadSample();
