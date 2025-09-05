"use client";

import { useState, useEffect } from 'react';

// Main App component for Daily Tasks
export default function DailyTasks() {
    const [monthlyGoals, setMonthlyGoals] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Array of months for the dropdown
    const monthsInEnglish = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Fetch monthly goals from API
    const fetchMonthlyGoals = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/monthly-goals');
            if (response.ok) {
                const data = await response.json();
                setMonthlyGoals(data);
            } else {
                console.error('Failed to fetch monthly goals');
            }
        } catch (error) {
            console.error('Error fetching monthly goals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load data from API on initial render
    useEffect(() => {
        fetchMonthlyGoals();
    }, []);

    // Check if all subtasks of a goal are completed
    const areAllSubtasksCompleted = (goal) => {
        if (!goal.subtasks || goal.subtasks.length === 0) return false;
        return goal.subtasks.every(subtask => subtask.completed);
    };

    const handleDeleteTodo = async (id, isSubtask) => {
        if (isSubtask) {
            try {
                const goalWithSubtask = monthlyGoals.find(goal =>
                    goal.subtasks.some(subtask => subtask._id === id)
                );

                if (goalWithSubtask) {
                    const updatedSubtasks = goalWithSubtask.subtasks.filter(subtask => subtask._id !== id);
                    const updatedGoal = {
                        ...goalWithSubtask,
                        subtasks: updatedSubtasks
                    };

                    const response = await fetch(`/api/monthly-goals/${goalWithSubtask._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedGoal),
                    });

                    if (response.ok) {
                        fetchMonthlyGoals();
                    } else {
                        console.error('Failed to delete subtask');
                    }
                }
            } catch (error) {
                console.error('Error deleting subtask:', error);
            }
        } else {
            try {
                const response = await fetch(`/api/monthly-goals/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchMonthlyGoals();
                } else {
                    console.error('Failed to delete todo');
                }
            } catch (error) {
                console.error('Error deleting todo:', error);
            }
        }
    };

    const handleToggleComplete = async (id, isSubtask) => {
        if (isSubtask) {
            try {
                const goalWithSubtask = monthlyGoals.find(goal =>
                    goal.subtasks.some(subtask => subtask._id === id)
                );

                if (goalWithSubtask) {
                    const updatedSubtasks = goalWithSubtask.subtasks.map(subtask =>
                        subtask._id === id ? { ...subtask, completed: !subtask.completed } : subtask
                    );

                    const updatedGoal = {
                        ...goalWithSubtask,
                        subtasks: updatedSubtasks
                    };

                    const response = await fetch(`/api/monthly-goals/${goalWithSubtask._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedGoal),
                    });

                    if (response.ok) {
                        fetchMonthlyGoals();
                    } else {
                        console.error('Failed to toggle subtask completion');
                    }
                }
            } catch (error) {
                console.error('Error toggling subtask completion:', error);
            }
        } else {
            try {
                const todoToUpdate = monthlyGoals.find(goal => goal._id === id);
                const updatedTodo = {
                    ...todoToUpdate,
                    completed: !todoToUpdate.completed
                };

                const response = await fetch(`/api/monthly-goals/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedTodo),
                });

                if (response.ok) {
                    fetchMonthlyGoals();
                } else {
                    console.error('Failed to toggle todo completion');
                }
            } catch (error) {
                console.error('Error toggling todo completion:', error);
            }
        }
    };

    const handleEditClick = (task) => {
        setEditingId(task._id);
        setEditValue(task.text);
    };

    const handleSaveEdit = async (id, isSubtask) => {
        if (editValue.trim() === '') return;

        if (isSubtask) {
            try {
                const goalWithSubtask = monthlyGoals.find(goal =>
                    goal.subtasks.some(subtask => subtask._id === id)
                );

                if (goalWithSubtask) {
                    const updatedSubtasks = goalWithSubtask.subtasks.map(subtask =>
                        subtask._id === id ? { ...subtask, text: editValue } : subtask
                    );

                    const updatedGoal = {
                        ...goalWithSubtask,
                        subtasks: updatedSubtasks
                    };

                    const response = await fetch(`/api/monthly-goals/${goalWithSubtask._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedGoal),
                    });

                    if (response.ok) {
                        setEditingId(null);
                        setEditValue('');
                        fetchMonthlyGoals();
                    } else {
                        console.error('Failed to update subtask');
                    }
                }
            } catch (error) {
                console.error('Error updating subtask:', error);
            }
        } else {
            try {
                const todoToUpdate = monthlyGoals.find(goal => goal._id === id);
                const updatedTodo = {
                    ...todoToUpdate,
                    text: editValue
                };

                const response = await fetch(`/api/monthly-goals/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedTodo),
                });

                if (response.ok) {
                    setEditingId(null);
                    setEditValue('');
                    fetchMonthlyGoals();
                } else {
                    console.error('Failed to update todo');
                }
            } catch (error) {
                console.error('Error updating todo:', error);
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditValue('');
    };

    // Combine todos and subtasks into a single array
    const allTasks = [
        ...monthlyGoals.map(goal => ({
            _id: goal._id,
            text: goal.text,
            completed: areAllSubtasksCompleted(goal),
            startDate: goal.createdAt ? new Date(goal.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            endDate: goal.createdAt ? new Date(goal.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            isSubtask: false,
            parentGoalName: "",
            parentDueMonth: goal.dueMonth,
            parentDueDays: goal.dueDays,
            allSubtasksCompleted: areAllSubtasksCompleted(goal),
        })),
        ...monthlyGoals.flatMap(goal =>
            goal.subtasks.map(subtask => ({
                ...subtask,
                _id: subtask._id,
                isSubtask: true,
                parentGoalName: goal.text,
                parentDueMonth: goal.dueMonth,
                parentDueDays: goal.dueDays,
                parentGoalId: goal._id,
            }))
        )
    ];

    // Filter tasks by selected month and date range
    const filteredByDateAndMonth = allTasks.filter(task => {
        if (selectedMonth) {
            return task.parentDueMonth === selectedMonth;
        }
        return true;
    });

    // Apply completion status filter
    const finalFilteredTasks = filteredByDateAndMonth.filter(task => {
        if (filter === 'completed') {
            return task.completed;
        }
        if (filter === 'incomplete') {
            return !task.completed;
        }
        return true;
    });

    // Apply search filter
    const filteredBySearch = finalFilteredTasks.filter(task => {
        const query = searchQuery.toLowerCase();
        return (
            task.text.toLowerCase().includes(query) ||
            (task.parentGoalName && task.parentGoalName.toLowerCase().includes(query)) ||
            (task.parentDueMonth && task.parentDueMonth.toLowerCase().includes(query))
        );
    }).sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date));

    const totalTasks = filteredBySearch.length;
    const completedTasks = filteredBySearch.filter(todo => todo.completed).length;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-4xl text-center">
                    <p className="text-base md:text-lg text-gray-700">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 md:py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-4xl">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-center text-gray-800 flex-1">
                        My Daily Tasks
                    </h1>
                    <a href="/monthly-goals" className="p-2 md:p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-bold text-sm md:text-base">
                        View Monthly Goals
                    </a>
                </div>

                {/* Filter and Stats Section */}
                <div className="mb-6 space-y-4">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">Filter Tasks</h2>
                    <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-2 md:space-y-0 md:space-x-4">
                        <div className="flex items-center space-x-2 w-full md:w-auto">
                            <label className="text-gray-600 text-sm md:text-base">Select Month:</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => {
                                    setSelectedMonth(e.target.value);
                                }}
                                className="flex-1 p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-gray-900"
                            >
                                <option value="">All Months</option>
                                {monthsInEnglish.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Completion Status Filters */}
                    <div className="flex justify-center space-x-2 md:space-x-4 mt-4">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 text-xs md:text-sm rounded-full transition duration-200 ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('completed')}
                            className={`px-3 py-1 text-xs md:text-sm rounded-full transition duration-200 ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            Completed
                        </button>
                        <button
                            onClick={() => setFilter('incomplete')}
                            className={`px-3 py-1 text-xs md:text-sm rounded-full transition duration-200 ${filter === 'incomplete' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            Incomplete
                        </button>
                    </div>

                    <div className="bg-gray-200 rounded-lg p-3 md:p-4 shadow-inner mt-4">
                        <p className="font-bold text-gray-700 text-sm md:text-base">Total Tasks: <span className="text-blue-600">{totalTasks}</span></p>
                        <p className="font-bold text-gray-700 text-sm md:text-base">Completed: <span className="text-green-600">{completedTasks}</span></p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks..."
                        className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-gray-900"
                    />
                </div>

                {/* Task List */}
                <div className="overflow-x-auto">
                    {filteredBySearch.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm md:text-lg">No tasks found for this period!</p>
                    ) : (
                        <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden text-sm md:text-base">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="py-2 px-3 md:py-3 md:px-4 font-bold text-left text-gray-700">Task</th>
                                    <th className="py-2 px-3 md:py-3 md:px-4 font-bold text-left text-gray-700">Timeline</th>
                                    <th className="py-2 px-3 md:py-3 md:px-4 font-bold text-left text-gray-700">Due Date</th>
                                    <th className="py-2 px-3 md:py-3 md:px-4 font-bold text-center text-gray-700">Status</th>
                                    <th className="py-2 px-3 md:py-3 md:px-4 font-bold text-center text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBySearch.map(task => (
                                    <tr key={task._id} className={`border-b border-gray-200 hover:bg-gray-100 transition duration-200 ${!task.isSubtask ? 'bg-blue-50' : ''}`}>
                                        {editingId === task._id ? (
                                            <>
                                                <td className="py-2 px-3 md:py-3 md:px-4">
                                                    <input
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="w-full p-1 md:p-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                                    />
                                                </td>
                                                <td className="py-2 px-3 md:py-3 md:px-4 text-xs md:text-sm text-gray-500">
                                                    {task.startDate && task.endDate ? `${task.startDate} - ${task.endDate}` : '—'}
                                                </td>
                                                <td className="py-2 px-3 md:py-3 md:px-4 text-xs md:text-sm text-gray-500">
                                                    {task.isSubtask ? `${task.parentDueMonth}, ${task.parentDueDays} days` : '—'}
                                                </td>
                                                <td className="py-2 px-3 md:py-3 md:px-4 text-center"></td>
                                                <td className="py-2 px-3 md:py-3 md:px-4 flex justify-center space-x-1 md:space-x-2">
                                                    <button
                                                        onClick={() => handleSaveEdit(task._id, task.isSubtask)}
                                                        className="p-1 md:p-2 bg-indigo-500 text-white rounded-md md:rounded-lg hover:bg-indigo-600 transition duration-200 text-xs"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="p-1 md:p-2 bg-gray-500 text-white rounded-md md:rounded-lg hover:bg-gray-600 transition duration-200 text-xs"
                                                    >
                                                        Cancel
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="py-2 px-3 md:py-3 md:px-4 text-gray-700">
                                                    <p className={`text-sm md:text-base font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                                        {task.text}
                                                        {task.allSubtasksCompleted && !task.isSubtask && (
                                                            <span className="ml-1 md:ml-2 text-[10px] md:text-xs bg-green-100 text-green-800 px-1 md:px-2 py-0.5 md:py-1 rounded-full">
                                                                All subtasks completed
                                                            </span>
                                                        )}
                                                    </p>
                                                    {task.isSubtask && (
                                                        <span className="text-[10px] md:text-sm text-gray-500 block">Parent Goal: {task.parentGoalName}</span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 md:py-3 md:px-4 text-xs md:text-sm text-gray-500">
                                                    {task.startDate && task.endDate ? `${task.startDate} - ${task.endDate}` : '—'}
                                                </td>
                                                <td className="py-2 px-3 md:py-3 md:px-4 text-gray-500 text-xs md:text-sm">
                                                    {task.isSubtask ? `${task.parentDueMonth}, ${task.parentDueDays} days` : '—'}
                                                </td>
                                                <td className="py-2 px-3 md:py-3 md:px-4 text-center">
                                                    <button
                                                        onClick={() => handleToggleComplete(task._id, task.isSubtask)}
                                                        className={`p-1 md:p-2 rounded-full border-2 transition duration-200 ease-in-out ${task.completed ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}
                                                    >
                                                        <svg className={`w-3 h-3 md:w-4 md:h-4 text-white ${task.completed ? '' : 'hidden'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                                    </button>
                                                </td>
                                                <td className="py-2 px-3 md:py-3 md:px-4 text-center flex justify-center space-x-1 md:space-x-2">
                                                    <button
                                                        onClick={() => handleEditClick(task)}
                                                        className="p-1 md:p-2 bg-yellow-500 text-white rounded-md md:rounded-lg hover:bg-yellow-600 transition duration-200 text-xs"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTodo(task._id, task.isSubtask)}
                                                        className="p-1 md:p-2 bg-red-500 text-white rounded-md md:rounded-lg hover:bg-red-600 transition duration-200 text-xs"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}