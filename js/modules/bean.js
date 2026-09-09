// Java Bean 模块
(function() {
    const BeanModule = {
        name: 'Java Bean',
        icon: 'fa-file-code',
        
        init: function(container) {
            container.innerHTML = `
                <div class="flex flex-col h-full gap-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-white">JSON → Java Bean</h3>
                        <button id="bean-run" class="btn-primary"><i class="fas fa-play"></i> 生成代码</button>
                    </div>
                    <textarea id="bean-output" class="editor-box flex-1" readonly placeholder="生成的 Java Bean 代码 (Lombok + Swagger)"></textarea>
                </div>
            `;

            document.getElementById('bean-run').onclick = () => this.generate();
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

            const classes = [];
            this.generateClass(parsed, 'Root', classes);
            
            const code = classes.join('\n\n');
            document.getElementById('bean-output').value = code;
            showToast('生成成功', 'success');
        },

        generateClass: function(obj, className, classes) {
            if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return;

            const fields = [];
            const nestedClasses = [];
            let fieldIndex = 0;

            for (const [key, value] of Object.entries(obj)) {
                const fieldName = this.toCamelCase(key);
                const fieldType = this.getJavaType(value, key, nestedClasses);
                
                const jsonProp = key !== fieldName ? `\n    @JsonProperty("${key}")` : '';
                fields.push(`    ${jsonProp}\n    @Schema(description = "${key}")\n    private ${fieldType} ${fieldName};`);
            }

            const classCode = `@Data\n@Builder\n@NoArgsConstructor\n@AllArgsConstructor\npublic class ${className} {\n${fields.join('\n')}\n}`;
            classes.push(classCode);

            for (const nested of nestedClasses) {
                this.generateClass(nested.obj, nested.name, classes);
            }
        },

        getJavaType: function(value, key, nestedClasses) {
            if (value === null) return 'Object';
            if (typeof value === 'boolean') return 'Boolean';
            if (typeof value === 'number') {
                return Number.isInteger(value) ? 'Integer' : 'Double';
            }
            if (typeof value === 'string') return 'String';

            if (Array.isArray(value)) {
                if (value.length === 0) return 'List<Object>';
                const itemType = this.getJavaType(value[0], key, nestedClasses);
                return `List<${itemType}>`;
            }

            // Nested object
            const className = this.toPascalCase(key) + 'Info';
            nestedClasses.push({ name: className, obj: value });
            return className;
        },

        toCamelCase: function(str) {
            return str.replace(/([-_][a-z])/ig, $1 => $1.toUpperCase().replace('-', '').replace('_', ''));
        },

        toPascalCase: function(str) {
            const camel = this.toCamelCase(str);
            return camel.charAt(0).toUpperCase() + camel.slice(1);
        }
    };

    if (window.AppInstance) {
        window.AppInstance.register('bean', BeanModule);
    }
})();
