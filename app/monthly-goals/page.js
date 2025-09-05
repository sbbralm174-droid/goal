"use client";

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

    // Array of months for the dropdown
    const monthsInEnglish = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Toggle subtask visibility for a specific goal
    const toggleSubtasks = (goalId) => {
        setExpandedGoals(prev => {
            // Close all other goals when opening a new one
            const newState = { [goalId]: !prev[goalId] };
            return newState;
        });
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

    // Add a new monthly goal
    const handleAddGoal = async (e) => {
        e.preventDefault();
        if (goalInput.trim() === '' || goalDueMonth.trim() === '' || goalDueDays.trim() === '') return;

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
                fetchMonthlyGoals(); // Refresh the list
            } else {
                console.error('Failed to add goal');
            }
        } catch (error) {
            console.error('Error adding goal:', error);
        }
    };

    // Delete a monthly goal
    const handleDeleteGoal = async (id) => {
        try {
            const response = await fetch(`/api/monthly-goals/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchMonthlyGoals(); // Refresh the list
            } else {
                console.error('Failed to delete goal');
            }
        } catch (error) {
            console.error('Error deleting goal:', error);
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

        if (subtaskText.trim() === '') return;

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
                fetchMonthlyGoals(); // Refresh the list
            } else {
                console.error('Failed to add subtask');
            }
        } catch (error) {
            console.error('Error adding subtask:', error);
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
                fetchMonthlyGoals(); // Refresh the list
            } else {
                console.error('Failed to delete subtask');
            }
        } catch (error) {
            console.error('Error deleting subtask:', error);
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
        if (editSubtaskText.trim() === '') return;

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
                fetchMonthlyGoals(); // Refresh the list
            } else {
                console.error('Failed to update subtask');
            }
        } catch (error) {
            console.error('Error updating subtask:', error);
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
        if (editValue.trim() === '' || editDueMonth.trim() === '' || editDueDays.trim() === '') return;

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
                fetchMonthlyGoals(); // Refresh the list
            } else {
                console.error('Failed to update goal');
            }
        } catch (error) {
            console.error('Error updating goal:', error);
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
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-2xl text-center">
                    <p className="text-sm md:text-lg text-gray-700">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 md:py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                    <h1 className="text-2xl md:text-4xl font-extrabold text-center text-gray-800 flex-1">
                        Monthly Goals
                    </h1>
                    <a href="/" className="p-2 md:p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-bold text-sm md:text-base">
                        Back to Daily Tasks
                    </a>
                </div>

                {/* Form to set a monthly goal */}
                <form onSubmit={handleAddGoal} className="space-y-3 md:space-y-4 mb-6">
                    <input
                        type="text"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        placeholder="Add a new monthly goal..."
                        className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-gray-900"
                    />
                    <div className="flex space-x-2 md:space-x-4">
                        <select
                            value={goalDueMonth}
                            onChange={(e) => setGoalDueMonth(e.target.value)}
                            className="w-1/2 p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-gray-900"
                        >
                            <option value="" disabled>Select Month</option>
                            {monthsInEnglish.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={goalDueDays}
                            onChange={(e) => setGoalDueDays(e.target.value)}
                            placeholder="Days to complete"
                            className="w-1/2 p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-gray-900"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-2 md:p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-bold text-sm md:text-base"
                    >
                        Add Goal
                    </button>
                </form>

                {/* Section for searching subtasks by date */}
                <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-200 mb-6">
                    <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">Search Tasks by Date</h3>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                        <input
                            type="date"
                            value={searchStartDate}
                            onChange={(e) => setSearchStartDate(e.target.value)}
                            className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-gray-900"
                        />
                        <input
                            type="date"
                            value={searchEndDate}
                            onChange={(e) => setSearchEndDate(e.target.value)}
                            className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-gray-900"
                        />
                        <button
                            onClick={handleSearchSubtasks}
                            className="w-full sm:w-auto p-2 md:p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 font-bold text-sm md:text-base"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Displaying filtered subtasks */}
                {filteredSubtasks.length > 0 && (
                    <div className="overflow-x-auto mb-6">
                        <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">Search Results</h3>
                        <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden text-sm md:text-base">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="py-2 px-3 md:py-3 md:px-4 font-bold text-left text-gray-700">Subtask</th>
                                    <th className="py-2 px-3 md:py-3 md:px-4 font-bold text-left text-gray-700">Parent Goal</th>
                                    <th className="py-2 px-3 md:py-3 md:px-4 font-bold text-left text-gray-700">Due Days</th>
                                    <th className="py-2 px-3 md:py-3 md:px-4 font-bold text-left text-gray-700">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubtasks.map((subtask, index) => (
                                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-100 transition duration-200">
                                        <td className="py-2 px-3 md:py-3 md:px-4 text-gray-700 text-sm md:text-base">{subtask.text}</td>
                                        <td className="py-2 px-3 md:py-3 md:px-4 text-gray-700 text-sm md:text-base">({subtask.parentGoal})</td>
                                        <td className="py-2 px-3 md:py-3 md:px-4 text-gray-500 text-xs md:text-sm">{subtask.parentDueDays} days</td>
                                        <td className="py-2 px-3 md:py-3 md:px-4 text-gray-500 text-xs md:text-sm">{subtask.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* List of monthly goals */}
                <div className="overflow-x-auto">
                    <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">All Monthly Goals</h3>
                    {monthlyGoals.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm md:text-base">No monthly goals have been set.</p>
                    ) : (
                        <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden text-sm md:text-base">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="py-2 px-3 md:py-3 md:px-4 font-bold text-left text-gray-700">Goal</th>
                                    <th className="py-2 px-3 md:py-3 md:px-4 font-bold text-left text-gray-700">Deadline</th>
                                    <th className="py-2 px-3 md:py-3 md:px-4 font-bold text-center text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyGoals.map(goal => (
                                    <tr key={goal._id} className="border-b border-gray-200 hover:bg-gray-100 transition duration-200">
                                        {editingId === goal._id ? (
                                            <>
                                                <td className="py-2 px-3 md:py-3 md:px-4">
                                                    <input
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="w-full p-1 md:p-2 text-sm border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                                    />
                                                </td>
                                                <td className="py-2 px-3 md:py-3 md:px-4">
                                                    <div className="flex space-x-1 md:space-x-2">
                                                        <select
                                                            value={editDueMonth}
                                                            onChange={(e) => setEditDueMonth(e.target.value)}
                                                            className="w-1/2 p-1 md:p-2 text-sm border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                                        >
                                                            <option value="" disabled>Month</option>
                                                            {monthsInEnglish.map(month => (
                                                                <option key={month} value={month}>{month}</option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="number"
                                                            value={editDueDays}
                                                            onChange={(e) => setEditDueDays(e.target.value)}
                                                            placeholder="Days"
                                                            className="w-1/2 p-1 md:p-2 text-sm border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-2 px-3 md:py-3 md:px-4 flex justify-center space-x-1 md:space-x-2">
                                                    <button
                                                        onClick={() => handleSaveGoalEdit(goal._id)}
                                                        className="p-1 md:p-2 text-xs bg-indigo-500 text-white rounded-md md:rounded-lg hover:bg-indigo-600 transition duration-200"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={handleCancelGoalEdit}
                                                        className="p-1 md:p-2 text-xs bg-gray-500 text-white rounded-md md:rounded-lg hover:bg-gray-600 transition duration-200"
                                                    >
                                                        Cancel
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="py-2 px-3 md:py-3 md:px-4 text-gray-700 text-sm md:text-base">
                                                    <div className="flex items-center justify-between">
                                                        <p>{goal.text}</p>
                                                        <button
                                                            onClick={() => toggleSubtasks(goal._id)}
                                                            className="ml-2 p-1 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200 text-xs font-bold"
                                                        >
                                                            {expandedGoals[goal._id] ? '-' : '+'}
                                                        </button>
                                                    </div>
                                                    
                                                    {expandedGoals[goal._id] && (
                                                        <>
                                                            <div className="mt-3 md:mt-4">
                                                                <h4 className="font-bold text-gray-700 text-xs md:text-sm mb-1 md:mb-2">Add Subtask</h4>
                                                                <div className="flex space-x-1 md:space-x-2">
                                                                    <input
                                                                        type="text"
                                                                        value={subtaskInputs[goal._id]?.text || ''}
                                                                        onChange={(e) => setSubtaskInputs({ ...subtaskInputs, [goal._id]: { ...subtaskInputs[goal._id], text: e.target.value } })}
                                                                        placeholder="Enter subtask..."
                                                                        className="w-full p-1 md:p-2 text-xs md:text-sm border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                                                    />
                                                                    <input
                                                                        type="date"
                                                                        value={subtaskInputs[goal._id]?.date || ''}
                                                                        onChange={(e) => setSubtaskInputs({ ...subtaskInputs, [goal._id]: { ...subtaskInputs[goal._id], date: e.target.value } })}
                                                                        className="w-full p-1 md:p-2 text-xs md:text-sm border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleAddSubtask(goal._id)}
                                                                        className="p-1 md:p-2 bg-blue-500 text-white rounded-md md:rounded-lg hover:bg-blue-600 transition duration-200 text-xs"
                                                                    >
                                                                        Add
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {goal.subtasks.length > 0 && (
                                                                <div className="mt-3 md:mt-4 overflow-x-auto">
                                                                    <h4 className="font-bold text-gray-700 text-xs md:text-sm mb-1 md:mb-2">Subtask List</h4>
                                                                    <table className="min-w-full bg-white rounded-lg border border-gray-200 text-xs">
                                                                        <thead>
                                                                            <tr className="bg-gray-100 text-left font-semibold text-gray-600 uppercase tracking-wider">
                                                                                <th className="py-1 px-2 md:py-2 md:px-4">Subtask</th>
                                                                                <th className="py-1 px-2 md:py-2 md:px-4">Date</th>
                                                                                <th className="py-1 px-2 md:py-2 md:px-4 text-center">Done</th>
                                                                                <th className="py-1 px-2 md:py-2 md:px-4 text-center">Actions</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {goal.subtasks.map((subtask, index) => (
                                                                                <tr key={index} className="border-t border-gray-200">
                                                                                    {editingSubtaskId === `${goal._id}-${index}` ? (
                                                                                        <>
                                                                                            <td className="py-1 px-2 md:py-2 md:px-4">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    value={editSubtaskText}
                                                                                                    onChange={(e) => setEditSubtaskText(e.target.value)}
                                                                                                    className="w-full p-0.5 md:p-1 text-xs border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900"
                                                                                                />
                                                                                            </td>
                                                                                            <td className="py-1 px-2 md:py-2 md:px-4">
                                                                                                <input
                                                                                                    type="date"
                                                                                                    value={editSubtaskDate}
                                                                                                    onChange={(e) => setEditSubtaskDate(e.target.value)}
                                                                                                    className="w-full p-0.5 md:p-1 text-xs border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900"
                                                                                                />
                                                                                            </td>
                                                                                            <td></td>
                                                                                            <td className="py-1 px-2 md:py-2 md:px-4 flex justify-center space-x-1">
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => handleSaveSubtaskEdit(goal._id, index)}
                                                                                                    className="p-1 text-[10px] bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                                                                                                >
                                                                                                    Save
                                                                                                </button>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={handleCancelSubtaskEdit}
                                                                                                    className="p-1 text-[10px] bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                                                                                >
                                                                                                    Cancel
                                                                                                </button>
                                                                                            </td>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <td className="py-1 px-2 md:py-2 md:px-4 text-xs md:text-sm text-gray-700">{subtask.text}</td>
                                                                                            <td className="py-1 px-2 md:py-2 md:px-4 text-xs text-gray-500">{subtask.date}</td>
                                                                                            <td className="py-1 px-2 md:py-2 md:px-4 text-center">
                                                                                                <input
                                                                                                    type="checkbox"
                                                                                                    checked={subtask.completed}
                                                                                                    onChange={() => handleToggleComplete(goal._id, index)}
                                                                                                    className="form-checkbox h-3 w-3 md:h-4 md:w-4 text-blue-600 rounded"
                                                                                                />
                                                                                            </td>
                                                                                            <td className="py-1 px-2 md:py-2 md:px-4 text-center flex justify-center space-x-1">
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => handleEditSubtaskClick(goal._id, index)}
                                                                                                    className="p-1 text-[10px] bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                                                                                >
                                                                                                    Edit
                                                                                                </button>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => handleDeleteSubtask(goal._id, index)}
                                                                                                    className="p-1 text-[10px] bg-red-500 text-white rounded-md hover:bg-red-600"
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
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 md:py-3 md:px-4 text-gray-500 text-xs md:text-sm">
                                                    Month: {goal.dueMonth}, Days: {goal.dueDays}
                                                </td>
                                                <td className="py-2 px-3 md:py-3 md:px-4 text-center flex justify-center space-x-1 md:space-x-2">
                                                    <button
                                                        onClick={() => handleEditClick(goal)}
                                                        className="p-1 md:p-2 bg-yellow-500 text-white rounded-md md:rounded-lg hover:bg-yellow-600 transition duration-200 text-xs"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteGoal(goal._id)}
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