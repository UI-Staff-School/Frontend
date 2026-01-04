/**
 * Utility functions for normalizing class level data
 * Handles different ID field names from the backend
 */

export type ClassLevel = {
  id?: string | number;
  className?: string;
  [key: string]: any;
};

/**
 * Normalizes a class level object to ensure it has an 'id' field
 * Backend might use different field names like '_id', 'classLevelId', etc.
 */
export function normalizeClassLevel(level: any): ClassLevel {
  // Try to find the ID field using common variations
  let id = level.id;
  if (id === undefined || id === null) {
    id = level._id || level.classLevelId || level.classLevel_id || level.Id || level.ID;
    
    if (id !== undefined && id !== null) {
      console.log(`[normalizeClassLevel] Normalized ID from alternative field:`, {
        className: level.className,
        originalIdField: Object.keys(level).find(k => 
          ['_id', 'classLevelId', 'classLevel_id', 'Id', 'ID'].includes(k) && level[k] === id
        ),
        normalizedId: id,
      });
    }
  }
  
  return {
    ...level,
    id: id, // Always use 'id' as the field name
  };
}

/**
 * Normalizes an array of class levels
 */
export function normalizeClassLevels(levels: any[]): ClassLevel[] {
  return levels.map((level, index) => {
    const normalized = normalizeClassLevel(level);
    
    // Log warning if still no ID after normalization
    if (normalized.id === undefined || normalized.id === null) {
      console.warn(`[normalizeClassLevels] Class level at index ${index} has no ID field:`, {
        level,
        allKeys: Object.keys(level),
        className: level.className,
      });
    }
    
    return normalized;
  });
}

<<<<<<< HEAD
=======




>>>>>>> habyaad_dev
