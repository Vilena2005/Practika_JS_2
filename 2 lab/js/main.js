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
        addTask() {

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
    </div>
    `,
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
  
Vue.component('task-on-start', {
    template: `
        <h3>New task</h3>
    `,
    methods: {
        
    }
})

let app = new Vue ( {
    el: '#app'
})