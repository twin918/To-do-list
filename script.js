class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.editingTaskId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderTasks();
        this.renderCalendar();
    }

    initializeElements() {
        // DOM 요소들
        this.taskInput = document.getElementById('taskInput');
        this.taskDateInput = document.getElementById('taskDateInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.toggleBtns = document.querySelectorAll('.toggle-btn');
        this.listView = document.querySelector('.list-view');
        this.calendarView = document.querySelector('.calendar-view');
        this.calendarDates = document.getElementById('calendarDates');
        this.currentMonthElement = document.getElementById('currentMonth');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.editModal = document.getElementById('editModal');
        this.editTaskInput = document.getElementById('editTaskInput');
        this.saveEditBtn = document.getElementById('saveEditBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.taskPriorityInput = document.getElementById('taskPriorityInput');
        this.priorityDropdown = document.getElementById('priorityDropdown');
        this.selectedPriority = document.getElementById('selectedPriority');
        this.priorityOptions = document.getElementById('priorityOptions');
        this.priorityValue = 'normal';
        this.editPriorityDropdown = document.getElementById('editPriorityDropdown');
        this.editSelectedPriority = document.getElementById('editSelectedPriority');
        this.editPriorityOptions = document.getElementById('editPriorityOptions');
        this.editPriorityValue = 'normal';
    }

    bindEvents() {
        // 할 일 추가
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        // 날짜 input 기본값 오늘로 설정
        if (this.taskDateInput) {
            this.taskDateInput.value = new Date().toISOString().split('T')[0];
        }

        // 뷰 토글
        this.toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => this.toggleView(btn.dataset.view));
        });

        // 달력 네비게이션
        this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));

        // 모달 이벤트
        this.saveEditBtn.addEventListener('click', () => this.saveEdit());
        this.cancelEditBtn.addEventListener('click', () => this.closeModal());
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeModal();
        });

        // 커스텀 중요도 드롭다운
        if (this.priorityDropdown) {
            this.selectedPriority.addEventListener('click', () => {
                this.priorityDropdown.classList.toggle('open');
            });
            this.priorityOptions.querySelectorAll('.priority-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    this.priorityValue = option.dataset.value;
                    this.selectedPriority.innerHTML = option.innerHTML;
                    this.priorityDropdown.classList.remove('open');
                    // 선택된 옵션에 selected 클래스 부여
                    this.priorityOptions.querySelectorAll('.priority-option').forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                });
            });
            // 바깥 클릭 시 닫기
            document.addEventListener('click', (e) => {
                if (!this.priorityDropdown.contains(e.target)) {
                    this.priorityDropdown.classList.remove('open');
                }
            });
        }
        // 편집 모달 커스텀 중요도 드롭다운
        if (this.editPriorityDropdown) {
            this.editSelectedPriority.addEventListener('click', () => {
                this.editPriorityDropdown.classList.toggle('open');
            });
            this.editPriorityOptions.querySelectorAll('.priority-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    this.editPriorityValue = option.dataset.value;
                    this.editSelectedPriority.innerHTML = option.innerHTML;
                    this.editPriorityDropdown.classList.remove('open');
                    // 선택된 옵션에 selected 클래스 부여
                    this.editPriorityOptions.querySelectorAll('.priority-option').forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                });
            });
            // 바깥 클릭 시 닫기
            document.addEventListener('click', (e) => {
                if (!this.editPriorityDropdown.contains(e.target)) {
                    this.editPriorityDropdown.classList.remove('open');
                }
            });
        }
    }

    addTask() {
        const text = this.taskInput.value.trim();
        const date = this.taskDateInput ? this.taskDateInput.value : new Date().toISOString().split('T')[0];
        // 커스텀 드롭다운 값 사용
        const priority = this.priorityValue || 'normal';
        if (!text || !date) return;

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            date: date,
            priority: priority
        };

        this.tasks.push(task);
        this.saveToLocalStorage();
        this.renderTasks();
        this.renderCalendar();
        this.taskInput.value = '';
        if (this.taskDateInput) {
            this.taskDateInput.value = new Date().toISOString().split('T')[0];
        }
        // 커스텀 드롭다운 초기화
        if (this.priorityDropdown) {
            const normalOption = this.priorityOptions.querySelector('.priority-option.normal');
            this.selectedPriority.innerHTML = normalOption.innerHTML;
            this.priorityValue = 'normal';
            this.priorityOptions.querySelectorAll('.priority-option').forEach(opt => opt.classList.remove('selected'));
            normalOption.classList.add('selected');
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveToLocalStorage();
        this.renderTasks();
        this.renderCalendar();
    }

    toggleTaskComplete(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveToLocalStorage();
            this.renderTasks();
            this.renderCalendar();
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            this.editingTaskId = taskId;
            this.editTaskInput.value = task.text;
            // 중요도 드롭다운 값 반영
            if (this.editPriorityDropdown) {
                const option = this.editPriorityOptions.querySelector(`.priority-option.${task.priority}`);
                this.editSelectedPriority.innerHTML = option.innerHTML;
                this.editPriorityValue = task.priority;
                this.editPriorityOptions.querySelectorAll('.priority-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            }
            this.editModal.classList.add('active');
        }
    }

    saveEdit() {
        const text = this.editTaskInput.value.trim();
        if (!text) return;

        const task = this.tasks.find(task => task.id === this.editingTaskId);
        if (task) {
            task.text = text;
            // 중요도 반영
            if (this.editPriorityDropdown) {
                task.priority = this.editPriorityValue;
            }
            this.saveToLocalStorage();
            this.renderTasks();
            this.renderCalendar();
        }

        this.closeModal();
    }

    closeModal() {
        this.editModal.classList.remove('active');
        this.editingTaskId = null;
        this.editTaskInput.value = '';
    }

    toggleView(view) {
        this.toggleBtns.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        if (view === 'list') {
            this.listView.classList.add('active');
            this.calendarView.classList.remove('active');
        } else {
            this.listView.classList.remove('active');
            this.calendarView.classList.add('active');
        }
    }

    changeMonth(delta) {
        this.currentMonth += delta;
        
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }

        this.renderCalendar();
    }

    renderTasks() {
        this.taskList.innerHTML = '';
        // 날짜별로 그룹화
        const grouped = {};
        this.tasks.forEach(task => {
            if (!grouped[task.date]) grouped[task.date] = [];
            grouped[task.date].push(task);
        });
        // 날짜 오름차순 정렬
        const dates = Object.keys(grouped).sort();
        dates.forEach(date => {
            const dateHeader = document.createElement('div');
            dateHeader.className = 'task-date-header';
            dateHeader.textContent = this.formatDateKorean(date);
            this.taskList.appendChild(dateHeader);
            // 우선순위 정렬: 긴급>중요>일반
            grouped[date].sort((a, b) => this.priorityOrder(a.priority) - this.priorityOrder(b.priority));
            grouped[date].forEach(task => {
                const taskElement = this.createTaskElement(task);
                this.taskList.appendChild(taskElement);
            });
        });
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskDiv.dataset.taskId = task.id;
        taskDiv.draggable = true;

        const priorityLabel = this.getPriorityLabel(task.priority);
        taskDiv.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}${priorityLabel}</span>
            <div class="task-actions">
                <button class="edit-btn">수정</button>
                <button class="delete-btn">삭제</button>
            </div>
        `;

        // 이벤트 리스너 추가
        const checkbox = taskDiv.querySelector('.task-checkbox');
        const editBtn = taskDiv.querySelector('.edit-btn');
        const deleteBtn = taskDiv.querySelector('.delete-btn');

        checkbox.addEventListener('change', () => this.toggleTaskComplete(task.id));
        editBtn.addEventListener('click', () => this.editTask(task.id));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

        // 드래그 앤 드롭 이벤트
        taskDiv.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.id);
        });

        return taskDiv;
    }

    renderCalendar() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        this.currentMonthElement.textContent = `${this.currentYear}년 ${this.currentMonth + 1}월`;

        this.calendarDates.innerHTML = '';

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dateDiv = document.createElement('div');
            dateDiv.className = 'calendar-date';
            // local date string (YYYY-MM-DD)
            const dateString = currentDate.getFullYear() + '-' + String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + String(currentDate.getDate()).padStart(2, '0');
            dateDiv.dataset.date = dateString;
            dateDiv.addEventListener('dragover', (e) => e.preventDefault());
            dateDiv.addEventListener('drop', (e) => this.handleDrop(e, dateDiv.dataset.date));

            const isCurrentMonth = currentDate.getMonth() === this.currentMonth;
            const isToday = this.isToday(currentDate);

            if (!isCurrentMonth) {
                dateDiv.classList.add('other-month');
            }

            if (isToday) {
                dateDiv.classList.add('today');
            }

            let dayTasks = this.tasks.filter(task => task.date === dateString);
            // 우선순위 정렬: 긴급>중요>일반
            dayTasks = dayTasks.sort((a, b) => this.priorityOrder(a.priority) - this.priorityOrder(b.priority));

            dateDiv.innerHTML = `
                <div class="date-number">${currentDate.getDate()}</div>
                <div class="task-preview">
                    ${dayTasks.map(task => `
                        <span><span class='priority-bar ${task.priority}'></span>${task.text}${task.completed ? ' <span title=\'완료됨\'>✔️</span>' : ''}</span>
                    `).join('')}
                </div>
            `;

            this.calendarDates.appendChild(dateDiv);
        }
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    getPriorityIcon(priority) {
        if (priority === 'urgent') return '🔴';
        if (priority === 'important') return '🟡';
        return '🟢';
    }
    priorityOrder(priority) {
        if (priority === 'urgent') return 0;
        if (priority === 'important') return 1;
        return 2;
    }
    handleDrop(e, date) {
        const taskId = e.dataTransfer.getData('text/plain');
        const task = this.tasks.find(t => t.id == taskId);
        if (task) {
            task.date = date;
            this.saveToLocalStorage();
            this.renderTasks();
            this.renderCalendar();
        }
    }

    formatDateKorean(dateStr) {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const d = new Date(dateStr);
        return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
    }

    getPriorityLabel(priority) {
        if (priority === 'urgent') return '<span class="priority-label urgent">긴급</span>';
        if (priority === 'important') return '<span class="priority-label important">중요</span>';
        return '<span class="priority-label normal">일반</span>';
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
}); 