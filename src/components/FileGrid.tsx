import React, { useMemo } from 'react';
import { Typography } from 'antd';
import { theme } from 'antd';
import type { Item } from '../services/api';
import FileItem from './FileItem';
import { useDeviceDetection } from '../utils/deviceDetection';

const { Text } = Typography;

interface FileGridProps {
  files: Item[];
  onPreview: (file: Item) => void;
  onDownload: (file: Item) => void;
  onDelete: (file: Item) => void;
  onShare: (file: Item) => void;
  loading?: boolean;
  selectedFileIds: Set<number>;
  onFileSelect: (fileId: number, selected: boolean) => void;
  isMobile?: boolean;
}

const FileGrid: React.FC<FileGridProps> = ({
  files,
  onPreview,
  onDownload,
  onDelete,
  onShare,
  loading,
  selectedFileIds,
  onFileSelect,
  isMobile = false
}) => {
  const { token } = theme.useToken();
  const { isMobile: isMobileDevice } = useDeviceDetection();

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      return a.filename.localeCompare(b.filename);
    });
  }, [files]);

  if (loading) {
    return (
      <div style={{
        padding: token.paddingXL,
        textAlign: 'center',
        color: token.colorTextSecondary,
        fontFamily: token.fontFamily
      }}>
        <Text>LOADING FILES...</Text>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div style={{
        padding: token.paddingXL,
        textAlign: 'center',
        color: token.colorTextSecondary,
        fontFamily: token.fontFamily
      }}>
        <Text>NO FILES FOUND IN THIS LOCATION</Text>
        <br />
        <Text style={{ fontSize: token.fontSizeSM }}>UPLOAD FILES TO GET STARTED</Text>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="file-grid-mobile">
        {sortedFiles.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onPreview={onPreview}
            onDownload={onDownload}
            onDelete={onDelete}
            onShare={onShare}
            selected={selectedFileIds.has(file.id)}
            onSelect={onFileSelect}
            isMobile={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: token.colorBgContainer,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Files List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isMobileDevice ? token.paddingSM : token.paddingMD
      }}>
        {sortedFiles.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onPreview={onPreview}
            onDownload={onDownload}
            onDelete={onDelete}
            onShare={onShare}
            selected={selectedFileIds.has(file.id)}
            onSelect={onFileSelect}
            isMobile={false}
          />
        ))}
      </div>
    </div>
  );
};

export default FileGrid;