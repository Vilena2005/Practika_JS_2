Vue.component('note-app', {
    template: `
        <div>
            <header class="app-header">
                <h1 class="app-title">Note</h1>
                <div class="header-buttons">
                    <task-create @create-task="addTask" :taskCount="tasks.length"></task-create>
                    <button @click="clearAllTasks" class="clear-button">Очистить все заметки</button>
                </div>
            </header>
            <main>
                <div class="tasks">
                    <task-on-start :tasks="tasks" :completedTasks="completedTasks" @transfer-task="moveTaskToProcess" @remove-task="removeTask"></task-on-start>
                </div>
                <div class="tasks">
                    <task-process :tasks="tasks" :completed-tasks="completedTasks" @transfer-task="moveTaskToFinish" @remove-task="removeCompletedTask"></task-process>
                </div>
                <div class="tasks">
                    <task-finish :completedTasks="completedTasks" :finished-tasks="finishedTasks"></task-finish>
                </div>
            </main>

            <modal-notification 
                v-if="showNotification" 
                :message="notificationMessage"
                @close="showNotification = false">
            </modal-notification>
        </div>
    `,
    data() {
        return {
            tasks: JSON.parse(localStorage.getItem('tasks')) || [],
            completedTasks: JSON.parse(localStorage.getItem('completedTasks')) || [],
            finishedTasks: JSON.parse(localStorage.getItem('finishedTasks')) || [],
            showNotification: false,
            notificationMessage: ''
        };
    },
    watch: {
        tasks: {
            handler(newTasks) {
                localStorage.setItem('tasks', JSON.stringify(newTasks));
            },
            deep: true
        },
        completedTasks: {
            handler(newCompletedTasks) {
                localStorage.setItem('completedTasks', JSON.stringify(newCompletedTasks));
            },
            deep: true
        },
        finishedTasks: {
            handler(newFinishedTasks) {
                localStorage.setItem('finishedTasks', JSON.stringify(newFinishedTasks));
            },
            deep: true
        }
    },
    methods: {
        showModal(message) {
            this.notificationMessage = message;
            this.showNotification = true;
        },
        addTask(taskData) {
            if (this.tasks.length < 3) {
                this.tasks.push({
                    title: taskData.title,
                    items: taskData.items.map(item => ({ ...item, checked: false, editingText: false, editText: null })),
                    editingTitle: false,
                    editTitle: null
                });
            } else {
                alert("В столбце START уже максимальное количество задач");
            }
        },
        moveTaskToProcess(task) {
            const index = this.tasks.findIndex(t => t === task);
            if (index !== -1) {
                this.tasks.splice(index, 1);
            }
            let countChecked = task.items.filter(item => item.checked).length;
            if (countChecked >= Math.ceil(task.items.length / 2)) {
                this.completedTasks.push(task);
            }
            this.showModal(`Задача "${task.title}" перемещена в столбец PROCESS`);
        },
        moveTaskToFinish(task) {
            const index = this.completedTasks.findIndex(t => t === task);
            if (index !== -1) {
                this.completedTasks.splice(index, 1);
            }
            let countChecked = task.items.filter(item => item.checked).length;
            if (countChecked === task.items.length) {
                task.finishDate = new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                this.finishedTasks.push(task);
            }
            this.showModal(`Задача "${task.title}" перемещена в столбец FINISH`);
        },
         removeTask(task) {
            const index = this.tasks.findIndex(t => t === task);
            if (index !== -1) {
                this.tasks.splice(index, 1);
            }
            this.showModal(`Задача "${task.title}" удалена`);
        },
        removeCompletedTask(task) {
            const index = this.completedTasks.findIndex(t => t === task);
            if (index !== -1) {
                this.completedTasks.splice(index, 1);
            }
            this.showModal(`Задача "${task.title}" удалена`);
        },
        clearAllTasks() {
            this.tasks = [];
            this.completedTasks = [];
            this.finishedTasks = [];
            localStorage.removeItem('tasks');
            localStorage.removeItem('completedTasks');
            localStorage.removeItem('finishedTasks');
            this.showModal('Все задачи очищены');
        }
    },
    computed: {
        isTaskLimitReached() {
            return this.tasks.length >= 3;
        }
    }
});

Vue.component('task-create', {
    template: `
        <div class="create-task">
            <input type="text" v-model="title" placeholder="Заголовок">
            <input type="text" v-model="itemOne" placeholder="Пункт один">
            <input type="text" v-model="itemTwo" placeholder="Пункт два">
            <input type="text" v-model="itemThree" placeholder="Пункт три">
            <input type="text" v-model="itemFour" v-if="itemThree !== '' && itemThree !== null" placeholder="Пункт четыре">
            <input type="text" v-model="itemFive" v-if="itemFour !== '' && itemFour !== null" placeholder="Пункт пять">
            <button @click="createTask" class="create-button"  :disabled="isTaskLimitReached">Создать заметку</button>
            <h4 v-if="isTaskLimitReached">Перед созданием новой задачи, выполните хотя бы одну задачу в первом столбце</h4>
        </div>
    `,
    computed: {
        isTaskLimitReached() {
            return this.$parent.isTaskLimitReached;
        }
    },
    props: ['taskCount'],
    data() {
        return {
            title: '',
            itemOne: '',
            itemTwo: '',
            itemThree: '',
            itemFour: '',
            itemFive: ''
        };
    },
    methods: {
        createTask() {
            if (!this.title.trim()) {
                alert("Пожалуйста, введите заголовок.");
                return;
            }
             if (this.$parent.tasks.some(task => task.title === this.title) ||
                this.$parent.completedTasks.some(task => task.title === this.title) ||
                this.$parent.finishedTasks.some(task => task.title === this.title)) {
                alert("Задача с таким названием уже существует");
                return;
            }

            const items = [];

            if (this.itemOne.trim() !== '') {
                items.push({ id: 1, text: this.itemOne });
            }

            if (this.itemTwo.trim() !== '') {
                items.push({ id: 2, text: this.itemTwo });
            }

            if (this.itemThree.trim() !== '') {
                items.push({ id: 3, text: this.itemThree });
            }

            if (this.itemFour.trim() !== '') {
                items.push({ id: 4, text: this.itemFour });
            }

            if (this.itemFive.trim() !== '') {
                items.push({ id: 5, text: this.itemFive });
            }

            if (items.length === 0) {
                alert("Пожалуйста, заполните хотя бы один пункт.");
                return;
            }

            const taskData = {
                title: this.title,
                items: items
            };
            this.$emit('create-task', taskData);
            this.cleanTask();
        },
        cleanTask() {
            this.title = '';
            this.itemOne = '';
            this.itemTwo = '';
            this.itemThree = '';
            this.itemFour = '';
            this.itemFive = '';
        }
    }
});

Vue.component('task-on-start', {
    props: [
        'tasks',
        'completedTasks'
    ],
    template: `
        <div>
            <h3 class="start">START</h3>
            <h4 v-if="isTaskProcessFull">Перед тем, как выполнять задачи этого столбца, выполните хотя бы одну задачу второго столбца</h4>
            <div v-for="(task, index) in tasks" :key="task.title" class="task task-move"
                 draggable="true"
                 @dragstart="onDragStart(index, $event)"
                 @dragover.prevent
                 @drop="onDrop(index, $event)"
            >
                <h3 v-if="!task.editingTitle" @click="editTitle(task)">{{ task.title }}</h3>
                <div v-else>
                    <input type="text" v-model="task.title" @blur="saveTitle(task)" @keyup.enter="saveTitle(task)" />
                </div>
                <p v-if="task.editTitle">Изменено: {{ task.editTitle }}</p>
                <ul class="task-list">
                    <li class="task-list-item" v-for="item in task.items" :key="item.id">
                        <input type="checkbox" :id="item.id" v-model="item.checked"
                               @change="checkItems(task, completedTasks, item)"
                               :disabled="isTaskProcessFull || ifChecked(item)">
                        <span v-if="!item.editingText" @click="editItem(item)">{{ item.text }}</span>
                        <input v-else type="text" v-model="item.text" @blur="saveItem(item)" @keyup.enter="saveItem(item)">
                        <p v-if="item.editText">Изменено: {{ item.editText }}</p>
                    </li>
                </ul>
                <button @click="removeTask(task)">Удалить</button> 
            </div>
        </div>
    `,
    computed: {
        isTaskProcessFull() {
            return this.completedTasks.length >= 5;
        }
    },
    methods: {
        editTitle(task) {
            task.editingTitle = true;
        },
        saveTitle(task) {
            task.editingTitle = false;
            task.editTitle = new Date().toLocaleString();
        },
        editItem(item) {
            item.editingText = true;
        },
        saveItem(item) {
            item.editingText = false;
            item.editText = new Date().toLocaleString();
        },
        checkItems(task, completedTasks, item) {
            if (this.isTaskProcessFull) {
                alert("Достигнут максимум элементов");
                item.checked = false;
                return;
            }
             let totalItems = task.items.length;
            let checkedItems = task.items.filter(item => item.checked).length;

            let percentage = (checkedItems / totalItems) * 100;

            if (percentage > 50) {
                const index = this.tasks.findIndex(t => t === task);
                if (index !== -1) {
                    this.$emit('transfer-task', this.tasks.splice(index, 1)[0]);
                }
            }
        },
        ifChecked(item) {
            return item.checked;
        },
        onDragStart(index, event) {
            event.dataTransfer.setData('text/plain', index);
            event.dataTransfer.effectAllowed = 'move';
            this.draggedIndex = index;
        },
        onDragOver(event) {
            event.preventDefault();
        },
        onDrop(index, event) {
            const droppedIndex = parseInt(event.dataTransfer.getData('text/plain'), 10);

            if (droppedIndex !== index) {
                const movedItem = this.tasks[droppedIndex];
                this.$set(this.tasks, droppedIndex, this.tasks[index]);
                this.$set(this.tasks, index, movedItem);
            }
        },
         removeTask(task) {
            this.$emit('remove-task', task);
        },
    }
});

Vue.component('task-process', {
    props: [
        'tasks',
        'completedTasks'
    ],
    template: `
        <div class="task-process">
            <h3 class="process">PROCESS</h3>
            <div v-for="(completedTask, index) in completedTasks" :key="completedTask.title" class="task task-move"
                 draggable="true"
                 @dragstart="onDragStart(index, $event)"
                 @dragover.prevent
                 @drop="onDrop(index, $event)"
            >
                 <h3 v-if="!completedTask.editingTitle" @click="editTitle(completedTask)">{{ completedTask.title }}</h3>
                <div v-else>
                    <input type="text" v-model="completedTask.title" @blur="saveTitle(completedTask)" @keyup.enter="saveTitle(completedTask)" />
                </div>
                 <p v-if="completedTask.editTitle">Изменено: {{ completedTask.editTitle }}</p>
                <ul class="task-list">
                    <li class="task-list-item" v-for="item in completedTask.items" :key="item.id">
                        <input type="checkbox" :id="item.id" v-model="item.checked" @change="checkItems(completedTask, item)" :disabled="ifChecked(item)">
                         <span v-if="!item.editingText" @click="editItem(item)">{{ item.text }}</span>
                        <input v-else type="text" v-model="item.text" @blur="saveItem(item)" @keyup.enter="saveItem(item)">
                         <p v-if="item.editText">Изменено: {{ item.editText }}</p>
                    </li>
                </ul>
                 <button @click="removeTask(completedTask)">Удалить</button> <!---- Remove ---->
            </div>
        </div>
    `,
    methods: {
        editTitle(task) {
            task.editingTitle = true;
        },
        saveTitle(task) {
            task.editingTitle = false;
            task.editTitle = new Date().toLocaleString();
        },
        editItem(item) {
            item.editingText = true;
        },
        saveItem(item) {
            item.editingText = false;
            item.editText = new Date().toLocaleString();
        },
        checkItems(completedTask, item) {
            let totalItems = completedTask.items.length;
            let checkedItems = completedTask.items.filter(item => item.checked).length;

            let percentage = (checkedItems / totalItems) * 100;

            if (percentage === 100) {
                const index = this.completedTasks.findIndex(c => c === completedTask);
                if (index !== -1) {
                    this.$emit('transfer-task', this.completedTasks.splice(index, 1)[0]);
                }
            }
        },
        ifChecked(item) {
            return item.checked;
        },
        onDragStart(index, event) {
            event.dataTransfer.setData('text/plain', index);
            event.dataTransfer.effectAllowed = 'move';
            this.draggedIndex = index;
        },
        onDragOver(event) {
            event.preventDefault();
        },
        onDrop(index, event) {
            const droppedIndex = parseInt(event.dataTransfer.getData('text/plain'), 10);

            if (droppedIndex !== index) {
                const movedItem = this.completedTasks[droppedIndex];
                this.$set(this.completedTasks, droppedIndex, this.completedTasks[index]);
                this.$set(this.completedTasks, index, movedItem);
            }
        },
         removeTask(completedTask) {
            this.$emit('remove-task', completedTask);
        },
    }
});

Vue.component('task-finish', {
    props: ['completedTasks', 'finishedTasks'],
    template: `
        <div class="task-finish">
            <h3 class="finish">FINISH</h3>
            <div v-for="finishedTask in finishedTasks" :key="finishedTask.title" class="task">
                <h3 v-if="!finishedTask.editingTitle" @click="editTitle(finishedTask)">{{ finishedTask.title }}</h3>
                <div v-else>
                    <input type="text" v-model="finishedTask.title" @blur="saveTitle(finishedTask)" @keyup.enter="saveTitle(finishedTask)" />
                </div>
                 <p v-if="finishedTask.editTitle">Изменено: {{ finishedTask.editTitle }}</p>
                <ul class="task-list">
                    <li class="task-list-item" v-for="item in finishedTask.items" :key="item.id">
                         <span v-if="!item.editingText" @click="editItem(item)">{{ item.text }}</span>
                        <input v-else type="text" v-model="item.text" @blur="saveItem(item)" @keyup.enter="saveItem(item)">
                         <p v-if="item.editText">Изменено: {{ item.editText }}</p>
                    </li>
                </ul>
                <p>Выполнено: {{ finishedTask.finishDate }}</p>
            </div>
        </div>
    `,
    methods: {
        editTitle(task) {
            task.editingTitle = true;
        },
        saveTitle(task) {
            task.editingTitle = false;
            task.editTitle = new Date().toLocaleString();
        },
        editItem(item) {
            item.editingText = true;
        },
        saveItem(item) {
            item.editingText = false;
            item.editText = new Date().toLocaleString();
        },
    }
})

Vue.component('modal-notification', {
    props: ['message'],
    template: `
      <div class="modal">
        <div class="modal-content">
          <p>{{ message }}</p>
          <button @click="$emit('close')">Закрыть</button>
        </div>
      </div>
    `
  });
  

let app = new Vue({
    el: '#app'
})
