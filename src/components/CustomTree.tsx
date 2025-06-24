import React from 'react';
import { Tree, Tooltip } from 'antd';
import { theme } from 'antd';
import type { Key } from 'antd/es/table/interface';

interface CustomTreeProps {
  treeData: any[];
  onSelect: (selectedKeys: Key[]) => void;
}

const CustomTree: React.FC<CustomTreeProps> = ({ treeData, onSelect }) => {
  const { token } = theme.useToken();

  const renderTreeNode = (node: any) => {
    const title = node.fullTitle ? (
      <Tooltip title={node.fullTitle} placement="right">
        <span style={{
          display: 'block',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {node.title}
        </span>
      </Tooltip>
    ) : node.title;

    return {
      ...node,
      title,
      children: node.children ? node.children.map(renderTreeNode) : undefined
    };
  };

  const processedTreeData = treeData.map(renderTreeNode);

  // Get all keys for expanded state
  const getAllKeys = (nodes: any[]): string[] => {
    const keys: string[] = [];
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        keys.push(node.key);
        keys.push(...getAllKeys(node.children));
      }
    });
    return keys;
  };

  const expandedKeys = getAllKeys(processedTreeData);

  return (
    <Tree
      treeData={processedTreeData}
      onSelect={onSelect}
      showIcon
      showLine={{ showLeafIcon: false }}
      expandedKeys={expandedKeys}
      style={{
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeSM,
        background: 'transparent'
      }}
      className="custom-tree"
    />
  );
};

export default CustomTree;