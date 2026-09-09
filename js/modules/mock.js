// Mock 数据生成模块
(function() {
    const MockModule = {
        name: 'Mock 数据',
        icon: 'fa-wand-magic-sparkles',
        
        init: function(container) {
            container.innerHTML = `
                <div class="flex flex-col h-full gap-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-white">Mock 数据生成</h3>
                        <button id="mock-run" class="btn-primary"><i class="fas fa-play"></i> 生成</button>
                    </div>
                    <div class="grid grid-cols-2 gap-4 flex-1 min-h-0">
                        <div class="flex flex-col">
                            <label class="text-xs text-gray-400 mb-2">模板配置 (支持 Faker.js)</label>
                            <textarea id="mock-template" class="editor-box flex-1" placeholder='{"count": 5, "template": {"name": "@name", "email": "@email"}}'></textarea>
                        </div>
                        <div class="flex flex-col">
                            <label class="text-xs text-gray-400 mb-2">生成结果</label>
                            <textarea id="mock-output" class="editor-box flex-1" readonly></textarea>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('mock-run').onclick = () => this.generate();
            
            // 加载示例
            setTimeout(() => {
                const templateBox = document.getElementById('mock-template');
                if (templateBox && !templateBox.value) {
                    templateBox.value = JSON.stringify({
                        count: 5,
                        template: {
                            id: '@integer',
                            name: '@name',
                            email: '@email',
                            phone: '@phone',
                            address: '@address',
                            company: '@company',
                            avatar: '@avatar'
                        }
                    }, null, 2);
                }
            }, 500);
        },

        activate: function(input) {
            // 可以用输入作为模板
        },

        generate: function() {
            const templateStr = document.getElementById('mock-template').value;
            const outputEl = document.getElementById('mock-output');

            let config;
            try {
                config = JSON.parse(templateStr);
            } catch (e) {
                showToast('无效的 JSON 配置', 'error');
                return;
            }

            const count = config.count || 5;
            const template = config.template || config;

            try {
                const result = [];
                for (let i = 0; i < count; i++) {
                    result.push(this.generateItem(template));
                }

                const output = count === 1 ? result[0] : result;
                outputEl.value = JSON.stringify(output, null, 2);
                showToast(`生成了 ${count} 条数据`, 'success');
            } catch (e) {
                showToast('生成失败：' + e.message, 'error');
            }
        },

        generateItem: function(template) {
            if (typeof template === 'string') {
                return this.parseFaker(template);
            }
            if (Array.isArray(template)) {
                return template.map(item => this.generateItem(item));
            }
            if (template !== null && typeof template === 'object') {
                const result = {};
                for (const [key, value] of Object.entries(template)) {
                    result[key] = this.generateItem(value);
                }
                return result;
            }
            return template;
        },

        parseFaker: function(str) {
            if (!str.startsWith('@')) return str;

            const fakerMap = {
                name: () => faker.person.fullName(),
                firstName: () => faker.person.firstName(),
                lastName: () => faker.person.lastName(),
                email: () => faker.internet.email(),
                phone: () => faker.phone.number(),
                address: () => faker.location.streetAddress(),
                city: () => faker.location.city(),
                country: () => faker.location.country(),
                company: () => faker.company.name(),
                avatar: () => faker.image.avatar(),
                url: () => faker.internet.url(),
                word: () => faker.lorem.word(),
                sentence: () => faker.lorem.sentence(),
                paragraph: () => faker.lorem.paragraph(),
                integer: () => faker.number.int({ min: 1, max: 1000 }),
                float: () => faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
                boolean: () => faker.datatype.boolean(),
                date: () => faker.date.past().toISOString(),
                uuid: () => faker.string.uuid(),
                color: () => faker.internet.color()
            };

            const key = str.slice(1).toLowerCase();
            if (fakerMap[key]) {
                return fakerMap[key]();
            }

            return str;
        }
    };

    if (window.AppInstance) {
        window.AppInstance.register('mock', MockModule);
    }
})();
