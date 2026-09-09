// JSON → Java Bean Module
const BeanModule = {
    inputEl: null,
    outputEl: null,

    init() {
        this.inputEl = document.getElementById('beanInput');
        this.outputEl = document.getElementById('beanOutput');
        console.log('[BeanModule] Initialized');
    },

    onActivate() {
        const mainInput = document.getElementById('inputJson');
        if (mainInput && mainInput.value.trim()) {
            this.inputEl.value = mainInput.value;
        }
    },

    onSync(data) {
        this.inputEl.value = data;
        if (document.getElementById('viewBean').classList.contains('hidden') === false) {
            this.doBeanConvert();
        }
    },

    doBeanConvert() {
        const input = this.inputEl.value.trim();
        if (!input) {
            this.outputEl.value = '';
            return;
        }

        try {
            const obj = JSON.parse(input);
            const result = this.generateBean(obj, 'Root');
            this.outputEl.value = result;
            showToast('Java Bean 生成完成', 'success');
        } catch (e) {
            showToast('JSON 解析错误：' + e.message, 'error');
            this.outputEl.value = '';
        }
    },

    generateBean(obj, className) {
        const classes = [];
        this.collectClasses(obj, className, classes);
        
        let result = 'import lombok.Builder;\n';
        result += 'import lombok.Data;\n';
        result += 'import lombok.NoArgsConstructor;\n';
        result += 'import lombok.AllArgsConstructor;\n';
        result += 'import io.swagger.v3.oas.annotations.media.Schema;\n';
        result += 'import com.fasterxml.jackson.annotation.JsonProperty;\n\n';
        
        classes.forEach(cls => {
            result += cls.code + '\n\n';
        });
        
        return result.trim();
    },

    collectClasses(obj, className, classes) {
        const existing = classes.find(c => c.name === className);
        if (existing) return existing.type;

        const classInfo = { name: className, fields: [], code: '' };
        classes.push(classInfo);

        if (Array.isArray(obj)) {
            if (obj.length > 0) {
                const itemType = this.getTypeName(obj[0]);
                if (itemType === 'object') {
                    const nestedClassName = className + 'Item';
                    const nestedType = this.collectClasses(obj[0], nestedClassName, classes);
                    return `List<${nestedClassName}>`;
                }
                return `List<${this.getJavaType(itemType, obj[0])}>`;
            }
            return 'List<Object>';
        }

        if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                const fieldName = this.toCamelCase(key);
                const typeName = this.getTypeName(value);
                
                let javaType;
                if (typeName === 'object') {
                    const nestedClassName = this.toPascalCase(fieldName);
                    javaType = this.collectClasses(value, nestedClassName, classes);
                } else if (typeName === 'array') {
                    const itemType = this.getTypeName(value[0] || null);
                    if (itemType === 'object' && value.length > 0) {
                        const nestedClassName = this.toPascalCase(fieldName) + 'Item';
                        const nestedType = this.collectClasses(value[0], nestedClassName, classes);
                        javaType = `List<${nestedClassName}>`;
                    } else {
                        javaType = `List<${this.getJavaType(itemType, value[0] || null)}>`;
                    }
                } else {
                    javaType = this.getJavaType(typeName, value);
                }

                const needsJsonProperty = key !== fieldName;
                classInfo.fields.push({
                    name: fieldName,
                    type: javaType,
                    originalKey: key,
                    needsJsonProperty
                });
            }

            // Generate class code
            let code = '@Data\n';
            code += '@Builder\n';
            code += '@NoArgsConstructor\n';
            code += '@AllArgsConstructor\n';
            code += `@Schema(description = "${className} 对象")\n`;
            code += `public class ${className} {\n`;
            
            classInfo.fields.forEach(field => {
                if (field.needsJsonProperty) {
                    code += `    @JsonProperty("${field.originalKey}")\n`;
                }
                code += `    @Schema(description = "${field.name}")\n`;
                code += `    private ${field.type} ${field.name};\n\n`;
            });
            
            code += '}';
            classInfo.code = code;
            classInfo.type = className;
            return className;
        }

        return this.getJavaType(this.getTypeName(obj), obj);
    },

    getTypeName(value) {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    },

    getJavaType(typeName, value) {
        switch (typeName) {
            case 'string': return 'String';
            case 'number': 
                if (value !== null && !Number.isInteger(value)) return 'Double';
                return 'Integer';
            case 'boolean': return 'Boolean';
            case 'null': return 'Object';
            default: return 'Object';
        }
    },

    toCamelCase(str) {
        return str.replace(/[-_\s]+(.)?/g, (match, chr) => chr ? chr.toLowerCase() : '');
    },

    toPascalCase(str) {
        const camel = this.toCamelCase(str);
        return camel.charAt(0).toUpperCase() + camel.slice(1);
    },

    getContentForCopy() {
        return this.outputEl?.value || '';
    }
};

App.registerModule('bean', BeanModule);
window.doBeanConvert = () => BeanModule.doBeanConvert();
