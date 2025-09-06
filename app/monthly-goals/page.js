"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Main App component for Monthly Goals
export default function MonthlyGoals() {
    // Main state to hold all monthly goals
    const [monthlyGoals, setMonthlyGoals] = useState([]);
    // State for the main goal input form
    const [goalInput, setGoalInput] = useState('');
    const [goalDueMonth, setGoalDueMonth] = useState('');
    const [goalDueDays, setGoalDueDays] = useState('');
    // State for editing a main goal
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [editDueMonth, setEditDueMonth] = useState('');
    const [editDueDays, setEditDueDays] = useState('');
    // State for managing subtask inputs for each individual goal
    const [subtaskInputs, setSubtaskInputs] = useState({});
    // State for editing an existing subtask
    const [editingSubtaskId, setEditingSubtaskId] = useState(null);
    const [editSubtaskText, setEditSubtaskText] = useState('');
    const [editSubtaskDate, setEditSubtaskDate] = useState('');
    // State for filtered subtasks based on date search
    const [filteredSubtasks, setFilteredSubtasks] = useState([]);
    const [searchStartDate, setSearchStartDate] = useState('');
    const [searchEndDate, setSearchEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    // State to track which goals' subtasks are expanded
    const [expandedGoals, setExpandedGoals] = useState({});
    // State for notifications
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    // State for delete confirmation
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, type: '', index: null });
    // State for progress calculation
    const [progress, setProgress] = useState({});

    // Array of months for the dropdown
    const monthsInEnglish = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    // Calculate progress for each goal
    useEffect(() => {
        const newProgress = {};
        monthlyGoals.forEach(goal => {
            if (goal.subtasks.length > 0) {
                const completed = goal.subtasks.filter(subtask => subtask.completed).length;
                newProgress[goal._id] = Math.round((completed / goal.subtasks.length) * 100);
            } else {
                newProgress[goal._id] = 0;
            }
        });
        setProgress(newProgress);
    }, [monthlyGoals]);

    // Toggle subtask visibility for a specific goal
    const toggleSubtasks = (goalId) => {
        setExpandedGoals(prev => ({
            ...prev,
            [goalId]: !prev[goalId]
        }));
    };

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
                showNotification('Failed to load goals', 'error');
            }
        } catch (error) {
            console.error('Error fetching monthly goals:', error);
            showNotification('Error loading goals', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Load data from API on initial render
    useEffect(() => {
        fetchMonthlyGoals();
    }, []);

    // Add a new monthly goal
    const handleAddGoal = async (e) => {
        e.preventDefault();
        if (goalInput.trim() === '' || goalDueMonth.trim() === '' || goalDueDays.trim() === '') {
            showNotification('Please fill all fields', 'error');
            return;
        }

        const newGoal = {
            text: goalInput,
            dueMonth: goalDueMonth,
            dueDays: goalDueDays,
            subtasks: []
        };

        try {
            const response = await fetch('/api/monthly-goals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newGoal),
            });

            if (response.ok) {
                setGoalInput('');
                setGoalDueMonth('');
                setGoalDueDays('');
                showNotification('Goal added successfully!');
                fetchMonthlyGoals(); // Refresh the list
            } else {
                console.error('Failed to add goal');
                showNotification('Failed to add goal', 'error');
            }
        } catch (error) {
            console.error('Error adding goal:', error);
            showNotification('Error adding goal', 'error');
        }
    };

    // Delete a monthly goal
    const handleDeleteGoal = async (id) => {
        try {
            const response = await fetch(`/api/monthly-goals/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                showNotification('Goal deleted successfully!');
                fetchMonthlyGoals(); // Refresh the list
                setDeleteConfirm({ show: false, id: null, type: '', index: null });
            } else {
                console.error('Failed to delete goal');
                showNotification('Failed to delete goal', 'error');
            }
        } catch (error) {
            console.error('Error deleting goal:', error);
            showNotification('Error deleting goal', 'error');
        }
    };

    // Start editing a monthly goal
    const handleEditClick = (goal) => {
        setEditingId(goal._id);
        setEditValue(goal.text);
        setEditDueMonth(goal.dueMonth);
        setEditDueDays(goal.dueDays);
    };

    // Add a new subtask to a specific goal
    const handleAddSubtask = async (goalId) => {
        // Get the subtask text and date from the state specific to this goal
        const subtaskText = subtaskInputs[goalId]?.text || '';
        const subtaskDate = subtaskInputs[goalId]?.date || '';

        if (subtaskText.trim() === '') {
            showNotification('Please enter a subtask', 'error');
            return;
        }

        try {
            const goalToUpdate = monthlyGoals.find(goal => goal._id === goalId);
            const updatedGoal = {
                ...goalToUpdate,
                subtasks: [...goalToUpdate.subtasks, {
                    text: subtaskText,
                    date: subtaskDate,
                    completed: false
                }]
            };

            const response = await fetch(`/api/monthly-goals/${goalId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedGoal),
            });

            if (response.ok) {
                // Clear the input fields for the specific goal after adding
                setSubtaskInputs(prev => ({
                    ...prev,
                    [goalId]: { text: '', date: '' }
                }));
                showNotification('Subtask added successfully!');
                fetchMonthlyGoals(); // Refresh the list
            } else {
                console.error('Failed to add subtask');
                showNotification('Failed to add subtask', 'error');
            }
        } catch (error) {
            console.error('Error adding subtask:', error);
            showNotification('Error adding subtask', 'error');
        }
    };

    // Delete a subtask from a specific goal
    const handleDeleteSubtask = async (goalId, subtaskIndex) => {
        try {
            const goalToUpdate = monthlyGoals.find(goal => goal._id === goalId);
            const updatedSubtasks = goalToUpdate.subtasks.filter((_, index) => index !== subtaskIndex);
            const updatedGoal = {
                ...goalToUpdate,
                subtasks: updatedSubtasks
            };

            const response = await fetch(`/api/monthly-goals/${goalId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedGoal),
            });

            if (response.ok) {
                showNotification('Subtask deleted successfully!');
                fetchMonthlyGoals(); // Refresh the list
                setDeleteConfirm({ show: false, id: null, type: '', index: null });
            } else {
                console.error('Failed to delete subtask');
                showNotification('Failed to delete subtask', 'error');
            }
        } catch (error) {
            console.error('Error deleting subtask:', error);
            showNotification('Error deleting subtask', 'error');
        }
    };

    // Toggle the completion status of a subtask
    const handleToggleComplete = async (goalId, subtaskIndex) => {
        try {
            const goalToUpdate = monthlyGoals.find(goal => goal._id === goalId);
            const updatedSubtasks = goalToUpdate.subtasks.map((subtask, index) => {
                if (index === subtaskIndex) {
                    return { ...subtask, completed: !subtask.completed };
                }
                return subtask;
            });

            const updatedGoal = {
                ...goalToUpdate,
                subtasks: updatedSubtasks
            };

            const response = await fetch(`/api/monthly-goals/${goalId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedGoal),
            });

            if (response.ok) {
                fetchMonthlyGoals(); // Refresh the list
            } else {
                console.error('Failed to toggle subtask completion');
            }
        } catch (error) {
            console.error('Error toggling subtask completion:', error);
        }
    };

    // Start editing a subtask
    const handleEditSubtaskClick = (goalId, subtaskIndex) => {
        const subtask = monthlyGoals.find(goal => goal._id === goalId).subtasks[subtaskIndex];
        setEditingSubtaskId(`${goalId}-${subtaskIndex}`);
        setEditSubtaskText(subtask.text);
        setEditSubtaskDate(subtask.date);
    };

    // Save an edited subtask
    const handleSaveSubtaskEdit = async (goalId, subtaskIndex) => {
        if (editSubtaskText.trim() === '') {
            showNotification('Subtask cannot be empty', 'error');
            return;
        }

        try {
            const goalToUpdate = monthlyGoals.find(goal => goal._id === goalId);
            const updatedSubtasks = goalToUpdate.subtasks.map((subtask, index) => {
                if (index === subtaskIndex) {
                    return { ...subtask, text: editSubtaskText, date: editSubtaskDate };
                }
                return subtask;
            });

            const updatedGoal = {
                ...goalToUpdate,
                subtasks: updatedSubtasks
            };

            const response = await fetch(`/api/monthly-goals/${goalId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedGoal),
            });

            if (response.ok) {
                setEditingSubtaskId(null);
                setEditSubtaskText('');
                setEditSubtaskDate('');
                showNotification('Subtask updated successfully!');
                fetchMonthlyGoals(); // Refresh the list
            } else {
                console.error('Failed to update subtask');
                showNotification('Failed to update subtask', 'error');
            }
        } catch (error) {
            console.error('Error updating subtask:', error);
            showNotification('Error updating subtask', 'error');
        }
    };

    // Cancel subtask editing
    const handleCancelSubtaskEdit = () => {
        setEditingSubtaskId(null);
        setEditSubtaskText('');
        setEditSubtaskDate('');
    };

    // Save an edited monthly goal
    const handleSaveGoalEdit = async (id) => {
        if (editValue.trim() === '' || editDueMonth.trim() === '' || editDueDays.trim() === '') {
            showNotification('Please fill all fields', 'error');
            return;
        }

        try {
            const goalToUpdate = monthlyGoals.find(goal => goal._id === id);
            const updatedGoal = {
                ...goalToUpdate,
                text: editValue,
                dueMonth: editDueMonth,
                dueDays: editDueDays
            };

            const response = await fetch(`/api/monthly-goals/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedGoal),
            });

            if (response.ok) {
                setEditingId(null);
                setEditValue('');
                setEditDueMonth('');
                setEditDueDays('');
                showNotification('Goal updated successfully!');
                fetchMonthlyGoals(); // Refresh the list
            } else {
                console.error('Failed to update goal');
                showNotification('Failed to update goal', 'error');
            }
        } catch (error) {
            console.error('Error updating goal:', error);
            showNotification('Error updating goal', 'error');
        }
    };

    // Cancel monthly goal editing
    const handleCancelGoalEdit = () => {
        setEditingId(null);
        setEditValue('');
        setEditDueMonth('');
        setEditDueDays('');
    };

    // Filter subtasks by date range
    const handleSearchSubtasks = () => {
        const startDate = searchStartDate ? new Date(searchStartDate) : null;
        const endDate = searchEndDate ? new Date(searchEndDate) : null;

        if (!startDate && !endDate) {
            setFilteredSubtasks([]);
            showNotification('Please select a date range', 'error');
            return;
        }

        const allSubtasks = monthlyGoals.flatMap(goal =>
            goal.subtasks.map((subtask, index) => ({
                ...subtask,
                parentGoal: goal.text,
                parentDueDays: goal.dueDays,
                goalId: goal._id,
                subtaskIndex: index
            }))
        );

        const filtered = allSubtasks.filter(subtask => {
            if (!subtask.date) return false;
            const subtaskDate = new Date(subtask.date);

            const isAfterStart = !startDate || subtaskDate >= startDate;
            const isBeforeEnd = !endDate || subtaskDate <= endDate;

            return isAfterStart && isBeforeEnd;
        });

        setFilteredSubtasks(filtered);
        
        if (filtered.length === 0) {
            showNotification('No tasks found in the selected date range', 'info');
        } else {
            showNotification(`Found ${filtered.length} tasks`, 'success');
        }
    };

    // Export tasks to CSV
    const handleExportCSV = () => {
        if (filteredSubtasks.length === 0) {
            showNotification('No tasks to export', 'info');
            return;
        }

        const headers = 'Subtask,Parent Goal,Due Days,Date,Completed\n';
        const csvContent = filteredSubtasks.map(task => 
            `"${task.text.replace(/"/g, '""')}","${task.parentGoal.replace(/"/g, '""')}",${task.parentDueDays},${task.date},${task.completed ? 'Yes' : 'No'}`
        ).join('\n');
        
        const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'monthly_goals_export.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Tasks exported successfully!');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl text-center">
                    <div className="flex justify-center mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                    <p className="text-lg text-gray-700">Loading your goals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-6 md:py-10 px-4 sm:px-6 lg:px-8">
            {/* Notification */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform ${notification.type === 'error' ? 'bg-red-500' : notification.type === 'info' ? 'bg-blue-500' : 'bg-green-500'}`}>
                    {notification.message}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteConfirm({ show: false, id: null, type: '', index: null })}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (deleteConfirm.type === 'goal') {
                                        handleDeleteGoal(deleteConfirm.id);
                                    } else if (deleteConfirm.type === 'subtask') {
                                        handleDeleteSubtask(deleteConfirm.id, deleteConfirm.index);
                                    }
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                                Monthly Goals
                            </h1>
                            <p className="text-gray-600 mt-2">Plan your month effectively</p>
                        </div>
                        <Link 
                            href="/" 
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back to Daily Tasks
                        </Link>
                    </div>

                    {/* Form to set a monthly goal */}
                    <form onSubmit={handleAddGoal} className="space-y-4 mb-8 p-6 bg-indigo-50 rounded-xl">
                        <h3 className="text-xl font-semibold text-indigo-800 mb-4">Add New Monthly Goal</h3>
                        <input
                            type="text"
                            value={goalInput}
                            onChange={(e) => setGoalInput(e.target.value)}
                            placeholder="What do you want to achieve this month?"
                            className="w-full p-3 text-base border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-900 bg-white"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                value={goalDueMonth}
                                onChange={(e) => setGoalDueMonth(e.target.value)}
                                className="w-full p-3 text-base border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-900 bg-white"
                            >
                                <option value="" disabled>Select Month</option>
                                {monthsInEnglish.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={goalDueDays}
                                    onChange={(e) => setGoalDueDays(e.target.value)}
                                    placeholder="Days to complete"
                                    min="1"
                                    className="w-full p-3 text-base border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-900 bg-white pr-12"
                                />
                                <span className="absolute right-3 top-3 text-gray-500">days</span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-bold text-base shadow-md"
                        >
                            Add Goal
                        </button>
                    </form>

                    {/* Section for searching subtasks by date */}
                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 mb-8">
                        <h3 className="text-xl font-semibold text-purple-800 mb-4">Search Tasks by Date Range</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-purple-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={searchStartDate}
                                    onChange={(e) => setSearchStartDate(e.target.value)}
                                    className="w-full p-3 text-base border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-purple-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={searchEndDate}
                                    onChange={(e) => setSearchEndDate(e.target.value)}
                                    className="w-full p-3 text-base border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 text-gray-900 bg-white"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleSearchSubtasks}
                                    className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 font-bold text-base shadow-md"
                                >
                                    Search Tasks
                                </button>
                            </div>
                        </div>
                        
                        {filteredSubtasks.length > 0 && (
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-lg font-medium text-purple-800">Search Results ({filteredSubtasks.length} tasks found)</h4>
                                    <button
                                        onClick={handleExportCSV}
                                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 text-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Export CSV
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
                                        <thead className="bg-purple-100">
                                            <tr>
                                                <th className="py-3 px-4 font-bold text-left text-purple-800">Subtask</th>
                                                <th className="py-3 px-4 font-bold text-left text-purple-800">Parent Goal</th>
                                                <th className="py-3 px-4 font-bold text-left text-purple-800">Due Days</th>
                                                <th className="py-3 px-4 font-bold text-left text-purple-800">Date</th>
                                                <th className="py-3 px-4 font-bold text-left text-purple-800">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSubtasks.map((subtask, index) => (
                                                <tr key={index} className="border-b border-purple-100 hover:bg-purple-50 transition duration-200">
                                                    <td className="py-3 px-4 text-gray-700">{subtask.text}</td>
                                                    <td className="py-3 px-4 text-gray-700">{subtask.parentGoal}</td>
                                                    <td className="py-3 px-4 text-gray-500">{subtask.parentDueDays} days</td>
                                                    <td className="py-3 px-4 text-gray-500">{subtask.date}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${subtask.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {subtask.completed ? 'Completed' : 'Pending'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* List of monthly goals */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Your Monthly Goals</h3>
                            <span className="text-gray-600">{monthlyGoals.length} goals</span>
                        </div>
                        
                        {monthlyGoals.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="text-gray-500 text-lg">No monthly goals have been set yet.</p>
                                <p className="text-gray-400 mt-2">Add your first goal using the form above!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {monthlyGoals.map(goal => (
                                    <div key={goal._id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                                        <div className="p-6">
                                            {editingId === goal._id ? (
                                                <div className="space-y-4">
                                                    <input
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="w-full p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-900"
                                                        placeholder="Goal title"
                                                    />
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <select
                                                            value={editDueMonth}
                                                            onChange={(e) => setEditDueMonth(e.target.value)}
                                                            className="w-full p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-900"
                                                        >
                                                            <option value="" disabled>Select Month</option>
                                                            {monthsInEnglish.map(month => (
                                                                <option key={month} value={month}>{month}</option>
                                                            ))}
                                                        </select>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                value={editDueDays}
                                                                onChange={(e) => setEditDueDays(e.target.value)}
                                                                placeholder="Days to complete"
                                                                min="1"
                                                                className="w-full p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 text-gray-900 pr-12"
                                                            />
                                                            <span className="absolute right-3 top-3 text-gray-500">days</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-3">
                                                        <button
                                                            onClick={() => handleSaveGoalEdit(goal._id)}
                                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-medium"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={handleCancelGoalEdit}
                                                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 font-medium"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <h4 className="text-xl font-semibold text-gray-800 mb-2">{goal.text}</h4>
                                                            <div className="flex items-center text-sm text-gray-600 mb-4">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                <span>Month: {goal.dueMonth}, Days: {goal.dueDays}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => toggleSubtasks(goal._id)}
                                                            className="ml-4 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedGoals[goal._id] ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Progress bar */}
                                                    {goal.subtasks.length > 0 && (
                                                        <div className="mb-4">
                                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                                <span>Progress</span>
                                                                <span>{progress[goal._id] || 0}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                                <div 
                                                                    className="bg-indigo-600 h-2.5 rounded-full" 
                                                                    style={{ width: `${progress[goal._id] || 0}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex space-x-3">
                                                        <button
                                                            onClick={() => handleEditClick(goal)}
                                                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition duration-200 text-sm font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm({ show: true, id: goal._id, type: 'goal', index: null })}
                                                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition duration-200 text-sm font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        
                                        {expandedGoals[goal._id] && (
                                            <div className="border-t border-gray-200 bg-gray-50 p-6">
                                                <h5 className="text-lg font-medium text-gray-800 mb-4">Subtasks</h5>
                                                
                                                <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                                                    <h6 className="font-medium text-gray-700 mb-2">Add New Subtask</h6>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                        <input
                                                            type="text"
                                                            value={subtaskInputs[goal._id]?.text || ''}
                                                            onChange={(e) => setSubtaskInputs({ ...subtaskInputs, [goal._id]: { ...subtaskInputs[goal._id], text: e.target.value } })}
                                                            placeholder="What needs to be done?"
                                                            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-200 text-gray-900"
                                                        />
                                                        <input
                                                            type="date"
                                                            value={subtaskInputs[goal._id]?.date || ''}
                                                            onChange={(e) => setSubtaskInputs({ ...subtaskInputs, [goal._id]: { ...subtaskInputs[goal._id], date: e.target.value } })}
                                                            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-200 text-gray-900"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddSubtask(goal._id)}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 text-sm font-medium"
                                                    >
                                                        Add Subtask
                                                    </button>
                                                </div>
                                                
                                                {goal.subtasks.length > 0 ? (
                                                    <div className="overflow-hidden rounded-lg border border-gray-200">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-100">
                                                                <tr>
                                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                                                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {goal.subtasks.map((subtask, index) => (
                                                                    <tr key={index} className="hover:bg-gray-50 transition duration-150">
                                                                        {editingSubtaskId === `${goal._id}-${index}` ? (
                                                                            <>
                                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={editSubtaskText}
                                                                                        onChange={(e) => setEditSubtaskText(e.target.value)}
                                                                                        className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900"
                                                                                    />
                                                                                </td>
                                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                                    <input
                                                                                        type="date"
                                                                                        value={editSubtaskDate}
                                                                                        onChange={(e) => setEditSubtaskDate(e.target.value)}
                                                                                        className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900"
                                                                                    />
                                                                                </td>
                                                                                <td className="px-4 py-3 whitespace-nowrap text-center">-</td>
                                                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                                                    <div className="flex justify-center space-x-2">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleSaveSubtaskEdit(goal._id, index)}
                                                                                            className="px-2 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs"
                                                                                        >
                                                                                            Save
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={handleCancelSubtaskEdit}
                                                                                            className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-xs"
                                                                                        >
                                                                                            Cancel
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                                                    <div className="flex items-center">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={subtask.completed}
                                                                                            onChange={() => handleToggleComplete(goal._id, index)}
                                                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3"
                                                                                        />
                                                                                        <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                                                                                            {subtask.text}
                                                                                        </span>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                                                    {subtask.date || '-'}
                                                                                </td>
                                                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${subtask.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                                        {subtask.completed ? 'Done' : 'Pending'}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                                                                                    <div className="flex justify-center space-x-2">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleEditSubtaskClick(goal._id, index)}
                                                                                            className="text-indigo-600 hover:text-indigo-900"
                                                                                        >
                                                                                            Edit
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => setDeleteConfirm({ show: true, id: goal._id, type: 'subtask', index })}
                                                                                            className="text-red-600 hover:text-red-900"
                                                                                        >
                                                                                            Delete
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                            </>
                                                                        )}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                        <p className="text-gray-500">No subtasks yet. Add your first one!</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="text-center text-gray-500 text-sm mt-8">
                    <p>Monthly Goals App • {new Date().getFullYear()}</p>
                </div>
            </div>
        </div>
    );
}