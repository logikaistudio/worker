// Master data management for departments, positions, etc.

const STORAGE_KEYS = {
    DEPARTMENTS: 'master_departments',
    POSITIONS: 'master_positions',
};

const DEFAULT_DEPARTMENTS = ['IT', 'Human Resources', 'Marketing', 'Finance', 'Operations', 'Sales'];
const DEFAULT_POSITIONS = ['Staff', 'Senior Staff', 'Supervisor', 'Manager', 'Senior Manager', 'Director'];

// Departments
export const getDepartments = (): string[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    return saved ? JSON.parse(saved) : DEFAULT_DEPARTMENTS;
};

export const addDepartment = (dept: string): void => {
    const current = getDepartments();
    if (!current.includes(dept)) {
        const updated = [...current, dept];
        localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(updated));
    }
};

export const removeDepartment = (dept: string): void => {
    const current = getDepartments();
    const updated = current.filter(d => d !== dept);
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(updated));
};

// Positions
export const getPositions = (): string[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.POSITIONS);
    return saved ? JSON.parse(saved) : DEFAULT_POSITIONS;
};

export const addPosition = (position: string): void => {
    const current = getPositions();
    if (!current.includes(position)) {
        const updated = [...current, position];
        localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(updated));
    }
};

export const removePosition = (position: string): void => {
    const current = getPositions();
    const updated = current.filter(p => p !== position);
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(updated));
};
