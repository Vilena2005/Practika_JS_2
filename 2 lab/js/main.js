Vue.component('note-app', {
    template: `
    <div id="note">
        <header>
            <h1 class="note-title">NoteBook</h1>
            <task-create @create-task="addTask" :taskCount="tasks.length"></task-create>
        </header>
        <main>
            <div class="task">
                <task-start :task="task" class="start">START</task-start>
            </div>
            <div class="task">
                <task-process :task="task" class="process">PROCESS</task-process>
            </div>
            <div class="task">
                <task-finish :task="completedTasks" class="finish">FINISHED</task-finish>
            </div>
        </main>
    </div>
    `,
    data () {
        return {
            tasks: JSON.parse(localStorage.getItem('task')) || [],
            completedTasks: JSON.parse(localStorage.getItem('completedTasks')) || [],
            finishedTasks: JSON.parse(localStorage.getItem('finishedTasks')) || []
        }
    },
    methods: {
        addTask(taskData) {
            this.tasks.push({
                title: taskData.title,
                items: taskData.items.map(item => ({ text: item, checked: false }))
            });
        },
        
        moveTaskToProcess(task) {
            const index = this.tasks.findIndex(t => t === task);
            if (index !== -1) {
                this.tasks.splice(index, 1);
            }
            let countChecked = task.items.filter(item => item.checked).length;
            if (countChecked >= Math.ceil(task.items.length / 2)) {
                this.tasksInProcess.push(task);
            }
        },
        
        moveTaskToFinish(task) {
            const index = this.tasksInProcess.findIndex(t => t === task);
            if (index !== -1) {
                this.tasksInProcess.splice(index, 1);
            } else {
                index = this.tasks.findIndex(t => t === task);
                if (index !== -1) {
                    this.tasks.splice(index, 1);
                }
            }
            let countChecked = task.items.filter(item => item.checked).length;
            if (countChecked === task.items.length) {
                task.finishDate = new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'});
                this.finishedTasks.push(task);
            }
        }
    }
})

Vue.component('task-create', {
    template: `
    <div class="create-task">
        <input type="text" v-model="Name" placeholder="Название">
        <input type="text" v-model="Item1" placeholder="Пункт 1">
        <input type="text" v-model="Item2" placeholder="Пункт 2">
        <input type="text" v-model="Item3" placeholder="Пункт 3">
        <input type="text" v-model="Item4" placeholder="Пункт 4">
        <button @click="createTask">Create task</button>
    </div>
    `,
    computed:{
        isTaskLimitReached(){
            return this.$parent.isTaskLimitReached;
        }
    },
    data () {
        return {
            name: '',
            Item1: '',
            Item2: '',
            Item3: '',
            Item4: ''
        }
    },
    methods: {
        createTask() {
            if (this.$parent.tasks.some(task => task.title === this.title) ||
                this.$parent.completedTasks.some(task => task.title === this.title) ||
                this.$parent.finishedTasks.some(task => task.title === this.title)) {
                    alert("Задача с таким названием уже существует");
                    return;
            }
            if (this.itemTwo() !== '') {
                items.push({text: this.itemTwo });
            }

            if (this.itemThree() !== '') {
                items.push({text: this.itemThree });
            }

            if (this.itemFour() !== '') {
                items.push({text: this.itemFour });
            }

            if (this.itemFive() !== '') {
                items.push({text: this.itemFive });
            }
            this.$emit('create-task', taskData);
            this.cleanTask();
        },
        cleanTask() {
            this.name = '';
            this.Item1 = '';
            this.Item2 = '';
            this.Item3 = '';
            this.Item4 = '';
        }
    }
})
  
Vue.component('task-start', {
    template: `
        <h3>{{ task.title }}</h3>
            <h4 v-if="isTaskProcessFull">Перед тем, как выполнять 
            задачи этого столбца, выполните хотя бы одну задачу второго столбца</h4>
            <div v-for="(task, index) in tasks" :key="task.title" class="task task-move"
        <ul>
            <li v-for="item in task.items" :key="item.id">
                <input type="checkbox" :id="item.id" v-model="item.checked" 
                @change="checkItems(task, completedTasks)" :disabled="isTaskProcessFull || ifChecked(item)"> 
                <p>{{ item.text }}</p>
            </li>
        </ul>
    `,
    methods: {
        checkItems() {
        if (this.isTaskProcessFull) {
            alert("Task column full");
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
        }
    }
})

Vue.component('task-process', {
    template: `
    <div>
        <h3>{{ task.title }}</h3>
            <ul>
                <li v-for="item in task.items" :key="item.id">
                    <input type="checkbox" :id="item.id" v-model="item.checked" 
                    @change="checkItems(task, completedTasks)" :disabled="isTaskProcessFull || ifChecked(item)"> 
                    <p>{{ item.text }}</p>
                </li>
            </ul>
    </div>
    `,
    methods: {
        checkItems() {
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
        ifChecked() {
            return item.checked;
        },
    }
})

Vue.component('task-finish', {
    template: `
    <div class="task-finish">
            <div v-for="finishedTask in finishedTasks" :key="finishedTask.title" class="task">
                <h3>{{ finishedTask.title }}</h3>
                <ul>
                    <li v-for="item in finishedTask.items" :key="item.id">
                        <p>{{ item.text }}</p>
                    </li>
                </ul>
                <p>Выполнено: {{ finishedTask.finishDate }}</p>
            </div>
        </div>
    `
})

let app = new Vue ( {
    el: '#app'
})