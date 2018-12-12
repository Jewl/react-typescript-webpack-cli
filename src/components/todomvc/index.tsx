import * as React from 'react';

require('./index.css');

interface TodoInterface {
    id?: number;
    completed?: string;
    title?: string;
}

interface StateInterface {
    newTodo: string;
    todoList: TodoInterface[];
    filteredTodos: TodoInterface[];
    editedTodo: TodoInterface;
    beforeEditCache: string;
    visibility: string;
}

const STORAGE_KEY = 'todos-react-ts-demo';
const filters = ['all', 'active', 'completed'];
const todoStorage = {
    uid: 1,
    fetch() {
        const todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        todos.forEach((todo: TodoInterface, index: number) => {
            todo.id = index;
        });
        todoStorage.uid = todos.length;
        return todos;
    },
    save(todos: TodoInterface[]) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
};

export class TodoMvc extends React.Component {

    state: StateInterface = {
        newTodo: '',
        filteredTodos: [],
        todoList: todoStorage.fetch(),
        editedTodo: {},
        beforeEditCache: '',
        visibility: 'all'
    };

    componentDidMount() {
        window.addEventListener('hashchange', this.onHashChange);
        this.onHashChange();
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.onHashChange);
    }

    render() {
        const { newTodo, todoList, editedTodo, visibility } = this.state;
        const remaining = todoList.filter((todo) => todo.completed === 'todo').length;
        const pluralize = remaining === 1 ? 'item' : 'items';
        const filter = this.fliterFactory();
        const filteredTodos = filter[visibility]();

        return (
            <section className="todoapp">
                <header className="header">
                    <h1>todos</h1>
                    <input className="new-todo"
                        autoFocus autoComplete="off"
                        placeholder="What needs to be done?"
                        value={newTodo}
                        onChange={this.handleOnChange}
                        onKeyDown={this.addTodo} />
                </header>
                {
                    !!filteredTodos.length && <section className="main">
                        <input className="toggle-all" type="checkbox" value="allDone" onChange={this.handleCheckBoxAll} />
                        <ul className="todo-list">
                            {filteredTodos.map((todo: TodoInterface, index: number) => (
                                <li key={todo.id}
                                    className={`todo${todo.completed === 'done' ? ' completed' : ''}${todo === editedTodo ? ' editing' : ''}`}>
                                    <div className="view">
                                        <input className="toggle" type="checkbox" checked={todo.completed === 'done'} onChange={this.handleCheckBox} data-id={todo.id} />
                                        <label onDoubleClick={this.editTodo} data-id={todo.id}>{todo.title}</label>
                                        <button className="destroy" onClick={this.removeTodo} data-id={todo.id} />
                                    </div>
                                    <input className="edit" type="text"
                                        defaultValue={todo.title}
                                        autoFocus={todo === editedTodo}
                                        onBlur={this.doneTodo}
                                        onKeyDown={this.handleEditTodo}
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>
                }
                {
                    !!todoList.length && <footer className="footer">
                        <span className="todo-count">
                            <strong>{remaining}</strong> {remaining && pluralize} left
                        </span>
                        <ul className="filters">
                            <li><a href="#/all" className={visibility === 'all' ? 'selected' : ''}>All</a></li>
                            <li><a href="#/active" className={visibility === 'active' ? 'selected' : ''}>Active</a></li>
                            <li><a href="#/completed" className={visibility === 'completed' ? 'selected' : ''}>Completed</a></li>
                        </ul>
                        {(todoList.length > remaining) && <button className="clear-completed" onClick={this.removeCompleted}>
                            Clear completed
                            </button>}
                    </footer>
                }
            </section>
        );
    }

    private onHashChange = () => {
        const visibility = window.location.hash.replace(/#\/?/, '');
        if (filters.indexOf(visibility) > -1) {
            this.setState({
                visibility
            });
        } else {
            window.location.hash = '';
            this.setState({
                visibility: 'all'
            });
        }
    }

    private addTodo = (event: React.KeyboardEvent) => {
        if (Number(event.keyCode) === 13) {
            const { newTodo, todoList } = this.state;
            todoList.push({
                id: todoStorage.uid++,
                completed: 'todo',
                title: newTodo.trim()
            });
            if (newTodo) {
                this.setState({
                    todoList,
                    newTodo: ''
                });
            }
            todoStorage.save(todoList);
        }
    }

    private handleOnChange = (event: React.ChangeEvent) => {
        const value = (event.target as HTMLInputElement).value;
        this.setState({
            newTodo: value
        });
    }

    private editTodo = (event: React.MouseEvent) => {
        const id = Number((event.target as Element).getAttribute('data-id'));
        const index = this.getIndex(id);
        const { todoList } = this.state;
        if (index > -1) {
            const todo = todoList[index];
            this.setState({
                editedTodo: todo
            });
        }
    }

    private removeTodo = (event: React.MouseEvent) => {
        const id = Number((event.target as Element).getAttribute('data-id'));
        const index = this.getIndex(id);
        const { todoList } = this.state;
        if (index > -1) {
            todoList.splice(index, 1);
            this.setState({
                todoList
            });
            todoStorage.save(todoList);
        }
    }

    private doneTodo = (event: React.ChangeEvent | React.KeyboardEvent) => {
        const value = (event.target as HTMLInputElement).value.trim();
        const { todoList, editedTodo } = this.state;
        const index = todoList.indexOf(editedTodo);
        if (index > -1) {
            todoList.splice(index, 1, { ...editedTodo, title: value });
            this.setState({
                todoList,
                editedTodo: null
            });
            todoStorage.save(todoList);
        }
    }

    private handleEditTodo = (event: React.KeyboardEvent) => {
        const keyCode = Number(event.keyCode);
        if (keyCode === 27) {
            this.setState({
                editedTodo: null
            });
        } else if (keyCode === 13) {
            this.doneTodo(event);
        }
    }

    private handleCheckBox = (event: React.ChangeEvent) => {
        const checked = (event.target as HTMLInputElement).checked;
        const id = Number((event.target as Element).getAttribute('data-id'));
        const index = this.getIndex(id);
        const { todoList } = this.state;
        if (index > -1) {
            todoList[index].completed = checked ? 'done' : 'todo';
        }
        this.setState({
            todoList
        });
        todoStorage.save(todoList);
    }

    private handleCheckBoxAll = (event: React.ChangeEvent) => {
        const checked = (event.target as HTMLInputElement).checked;
        const { todoList } = this.state;
        const completed = checked ? 'done' : 'todo';
        todoList.forEach((todo) => {
            todo.completed = completed;
        });
        this.setState({
            todoList
        });
        todoStorage.save(todoList);
    }

    private removeCompleted = (event: React.MouseEvent) => {
        const { todoList } = this.state;
        todoList.forEach((todo, index: number) => {
            if (todo.completed === 'done') {
                todoList.splice(index, 1);
            }
        });
        this.setState({
            todoList
        });
        todoStorage.save(todoList);
    }

    private fliterFactory = () => {
        const { todoList } = this.state;

        return {
            all() {
                return todoList;
            },
            active() {
                return todoList.filter((todo) => todo.completed === 'todo');
            },
            completed() {
                return todoList.filter((todo) => todo.completed === 'done');
            }
        };
    }

    private getIndex(id: number) {
        const { todoList } = this.state;
        let index = -1;
        todoList.forEach((todo, i: number) => {
            if (todo.id === id) {
                index = i;
            }
        });
        return index;
    }
}

export default TodoMvc;