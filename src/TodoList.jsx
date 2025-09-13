import { useState, useEffect } from 'react';
import 'normalize.css';
import './todo.css'

const today = new Date().toISOString().split('T')[0];
const priorityLabels = {
    high: '高',
    med: '中',
    low: '低',
};
const dateOption = {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
};                

export default function TodoList() {
    const [items, setItems] = useState({
        title: '',
        date: today,
        priority: 'med',
        pic: '',
        memo: '',
    });

    const [todo, setTodo] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('todo')) || [];
        } catch (e) {
            console.error('ローカルストレージの読み込みに失敗しました:', e);
            return [];
    }});
    
    const [sortOrder, setSortOrder] = useState('asc');

    const [priorityFilter, setPriorityFilter] = useState('all');

    const [error, setError] = useState('');

    useEffect(() => {
        localStorage.setItem('todo', JSON.stringify(todo));
    }, [todo]);

    const addTodo = () => {
        if (!items.title.trim() || !items.pic.trim()) {
            setError('タイトルと担当者は入力必須です');
            return;
        }
        setError('');
        
        const newItem = {
            ...items,
            id: Date.now(),
            status: 'untouched',
        };
        
        setTodo(prev => [...prev, newItem]);
        
        setItems({
            title: '',
            priority: 'med',
            date: today,
            pic: '',
            memo: '',
        });
    };
    
    const toggleSortOrder = () => {
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    };
    
    const sortedTodo = [...todo].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    const filteredTodo = sortedTodo.filter(item => {
        if (priorityFilter === 'all')
            return true;
        return item.priority === priorityFilter;
    });
    
    const handleChange = e => {
        const {name, value} = e.target;
        setItems(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    
    const toggleDone = (id, status) => {
        setTodo(prev =>
            prev.map(item =>
                item.id === id ? {...item, status} : item)
        );
    };

    const updateMemo = (id, newMemo) => {
        setTodo(prev =>
            prev.map(item =>
                item.id === id ? { ...item, memo: newMemo } : item)
        );
    };

    const deleteTodo = id => {
        setTodo(prev => prev.filter(item => item.id !== id));
    };
    
    const deleteCompleted = () => {
        if (!window.confirm('完了したTODOを本当に削除しますか？')) {
            return;
        }
        setTodo(prev => prev.filter(item => item.status !== 'completed'));
    };
    
    return (
        <div className="main">
            <div className="wrapper">
                <h1>TODOリスト</h1>
                <div className="line-spacing">
                    <label htmlFor="title">タイトル：</label>
                    <input type="text" id="title" name="title" value={items.title} onChange={handleChange} />
                </div>
                <div className="line-spacing">
                    <label htmlFor="date">期日：</label>
                    <input type="date" id="date" name="date" value={items.date} onChange={handleChange} min={today} />
                </div>
                <div className="line-spacing">
                    <label htmlFor="priority">優先度：</label>
                    <select id="priority" name="priority" value={items.priority} onChange={handleChange}>
                        <option value="low">低</option>
                        <option value="med">中</option>
                        <option value="high">高</option>
                    </select>
                </div>
                <div className="line-spacing">
                    <label htmlFor="pic">担当者：</label>
                    <input type="text" id="pic" name="pic" value={items.pic} onChange={handleChange} />
                </div>
                <div className="line-spacing memo-spacing">
                    <label htmlFor="memo">メモ：</label>
                    <textarea id="memo" name="memo" value={items.memo} onChange={handleChange} rows="4" cols="40"></textarea>
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="button" onClick={addTodo} className="add-button">追加</button>
            </div>
            
            {todo.length > 0 ? (
                <div className="wrapper">
                    <div className="change-actions">
                        <button type="button" onClick={toggleSortOrder} className="toggle-button">{sortOrder === 'asc' ? '期限が遠い順に表示' : '期限が近い順に表示'}</button>
                        <button type="button" onClick={deleteCompleted} className="delete-button">完了したTODOをまとめて削除</button>
                        <div>
                            <label htmlFor="priority-filter">優先度フィルター：</label>
                            <select id="priority-filter" name="priority-filter" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                                <option value="all">全て</option>
                                <option value="high">高</option>
                                <option value="med">中</option>
                                <option value="low">低</option>
                            </select>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>タイトル</th>
                                <th>期日</th>
                                <th>優先度</th>
                                <th>担当者</th>
                                <th>進捗状況</th>
                                <th>メモ</th>
                                <th>削除</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTodo.map(item => (
                                <tr key={item.id} className={item.status === 'completed' ? 'done' : ''}>
                                    <td data-label="タイトル：" className="res-title">{item.title}</td>
                                    <td data-label="期日：">{new Date(item.date).toLocaleDateString('ja-JP', dateOption)}</td>
                                    <td data-label="優先度：" className={item.priority === 'high' ? 'high' : ''}>{priorityLabels[item.priority]}</td>
                                    <td data-label="担当者：">{item.pic}</td>
                                    <td data-label="進捗状況：">
                                        <select name="status" value={item.status} onChange={e => toggleDone(item.id, e.target.value)}>
                                            <option value="untouched">未着手</option>
                                            <option value="progress">進行中</option>
                                            <option value="completed">完了</option>
                                        </select>
                                    </td>
                                    <td data-label="メモ：">
                                        <label htmlFor={`memo-${item.id}`} className="sr-only">メモ：</label>
                                        <textarea id={`memo-${item.id}`} name="memo" value={item.memo} onChange={e => updateMemo(item.id, e.target.value)} rows="4" cols="40"></textarea>
                                    </td>
                                    <td className="res-button"><button type="button" onClick={() => deleteTodo(item.id)} className="delete-button">削除</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>) : (<h2>登録されたTODOはありません</h2>)
            }
        </div>
    );
}