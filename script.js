// Todo应用主逻辑
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadTodos();
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        const addBtn = document.getElementById('addBtn');
        const todoInput = document.getElementById('todoInput');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const clearCompleted = document.getElementById('clearCompleted');

        addBtn.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        clearCompleted.addEventListener('click', () => this.clearCompleted());
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();

        if (text === '') return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.render();
        input.value = '';
        input.focus();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        this.todos = this.todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        this.saveTodos();
        this.render();
    }

    editTodo(id, newText) {
        if (newText.trim() === '') {
            this.deleteTodo(id);
            return;
        }
        this.todos = this.todos.map(todo => 
            todo.id === id ? { ...todo, text: newText.trim() } : todo
        );
        this.saveTodos();
        this.render();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.render();
    }

    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveTodos();
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    getActiveTodoCount() {
        return this.todos.filter(todo => !todo.completed).length;
    }

    render() {
        const todoList = document.getElementById('todoList');
        const taskCount = document.getElementById('taskCount');
        const filteredTodos = this.getFilteredTodos();
        const activeCount = this.getActiveTodoCount();

        todoList.innerHTML = '';

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '<li class="empty-message">暂无任务</li>';
            return;
        }

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            if (todo.completed) {
                li.classList.add('completed');
            }
            li.dataset.id = todo.id;

            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="edit-btn">✏️</button>
                    <button class="delete-btn">🗑️</button>
                </div>
            `;

            const checkbox = li.querySelector('.todo-checkbox');
            const editBtn = li.querySelector('.edit-btn');
            const deleteBtn = li.querySelector('.delete-btn');
            const todoText = li.querySelector('.todo-text');

            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
            
            editBtn.addEventListener('click', () => {
                this.startEdit(li, todo);
            });

            todoList.appendChild(li);
        });

        taskCount.textContent = `${activeCount} 个待办任务`;
    }

    startEdit(li, todo) {
        const todoText = li.querySelector('.todo-text');
        const currentText = todo.text;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'todo-edit';
        input.value = currentText;
        
        todoText.replaceWith(input);
        input.focus();
        input.select();

        const finishEdit = () => {
            this.editTodo(todo.id, input.value);
        };

        input.addEventListener('blur', finishEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.target.blur();
            }
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        if (saved) {
            try {
                this.todos = JSON.parse(saved);
            } catch (e) {
                console.error('加载todos失败:', e);
                this.todos = [];
            }
        }
    }
}

// 计算器类
class Calculator {
    constructor() {
        this.display = document.getElementById('calcDisplay');
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForValue = false;
        this.init();
    }

    init() {
        const toggleBtn = document.getElementById('calcToggle');
        const closeBtn = document.getElementById('calcClose');
        const buttons = document.querySelectorAll('.calc-btn');

        toggleBtn.addEventListener('click', () => this.show());
        closeBtn.addEventListener('click', () => this.hide());

        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleClick(e.target);
            });
        });
    }

    show() {
        document.getElementById('calculator').classList.remove('hidden');
    }

    hide() {
        document.getElementById('calculator').classList.add('hidden');
    }

    handleClick(button) {
        const text = button.textContent;

        if (button.classList.contains('number')) {
            this.inputNumber(text);
        } else if (button.classList.contains('operator')) {
            this.inputOperator(button.dataset.operator);
        } else if (button.classList.contains('equals')) {
            this.calculate();
        } else if (button.classList.contains('clear')) {
            if (text === 'AC') {
                this.reset();
            } else {
                this.clear();
            }
        }
    }

    inputNumber(num) {
        if (this.waitingForValue) {
            this.currentValue = num;
            this.waitingForValue = false;
        } else {
            this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
        }
        this.updateDisplay();
    }

    inputOperator(op) {
        const currentValue = parseFloat(this.currentValue);

        if (this.previousValue === null) {
            this.previousValue = currentValue;
        } else if (this.operator) {
            const result = this.performCalculation();
            this.currentValue = String(result);
            this.previousValue = result;
            this.updateDisplay();
        }

        this.waitingForValue = true;
        this.operator = op;
    }

    performCalculation() {
        const prev = parseFloat(this.previousValue);
        const curr = parseFloat(this.currentValue);

        switch (this.operator) {
            case '+':
                return prev + curr;
            case '-':
                return prev - curr;
            case '*':
                return prev * curr;
            case '/':
                return curr !== 0 ? prev / curr : 0;
            case '%':
                return prev % curr;
            default:
                return curr;
        }
    }

    calculate() {
        if (this.previousValue !== null && this.operator) {
            const result = this.performCalculation();
            this.currentValue = String(result);
            this.previousValue = null;
            this.operator = null;
            this.waitingForValue = true;
            this.updateDisplay();
        }
    }

    clear() {
        this.currentValue = '0';
        this.updateDisplay();
    }

    reset() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForValue = false;
        this.updateDisplay();
    }

    updateDisplay() {
        this.display.value = this.currentValue;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
    new Calculator();
});

