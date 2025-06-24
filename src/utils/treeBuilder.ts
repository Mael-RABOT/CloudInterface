export interface TreeNode {
  title: string;
  key: string;
  iconType: 'root' | 'folder';
  fullTitle?: string;
  children?: TreeNode[];
  isLeaf?: boolean;
}

/**
 * Builds a nested tree structure from location strings
 * @param locations Array of location strings (e.g., ["test", "test/new", "docs", "docs/api"])
 * @returns Tree structure with proper nesting
 */
export const buildLocationTree = (locations: string[]): TreeNode[] => {
  // Create a map to store all nodes by their path
  const nodeMap = new Map<string, TreeNode>();

  // Add root node
  const rootNode: TreeNode = {
    title: 'ROOT',
    key: '',
    iconType: 'root',
    children: []
  };
  nodeMap.set('', rootNode);

  // Sort locations to ensure parent nodes are created before children
  const sortedLocations = [...locations].sort();

  for (const location of sortedLocations) {
    if (!location) continue;

    const pathParts = location.split('/');
    let currentPath = '';

    // Build the path hierarchy
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      // Create node if it doesn't exist
      if (!nodeMap.has(currentPath)) {
        const isLeaf = i === pathParts.length - 1;
        const displayTitle = part.length > 20 ? part.substring(0, 17) + '...' : part;

        const node: TreeNode = {
          title: displayTitle,
          key: currentPath,
          iconType: 'folder',
          fullTitle: currentPath, // Store full path for tooltip
          children: isLeaf ? undefined : [],
          isLeaf
        };

        nodeMap.set(currentPath, node);

        // Add to parent's children
        const parentNode = nodeMap.get(parentPath);
        if (parentNode && parentNode.children) {
          parentNode.children.push(node);
        }
      }
    }
  }

  // Sort children alphabetically for each node
  const sortNodeChildren = (node: TreeNode) => {
    if (node.children) {
      node.children.sort((a, b) => a.title.localeCompare(b.title));
      node.children.forEach(sortNodeChildren);
    }
  };

  sortNodeChildren(rootNode);

  return [rootNode];
};

/**
 * Checks if a location is a child of another location
 * @param parent Parent location path
 * @param child Child location path
 * @returns True if child is a descendant of parent
 */
export const isLocationChild = (parent: string, child: string): boolean => {
  if (!parent) return true; // Root is parent of everything
  if (parent === child) return false; // Same location

  return child.startsWith(parent + '/');
};

/**
 * Gets all files that belong to a location (including nested locations)
 * @param files Array of file items
 * @param location Location path to filter by
 * @returns Filtered array of files
 */
export const getFilesForLocation = (files: any[], location: string): any[] => {
  if (!location) return files; // Root shows all files

  return files.filter(file => {
    if (!file.location) return false;
    return file.location === location || isLocationChild(location, file.location);
  });
};