# Cloud Interface v2.0 - Terminal Edition

A retro-styled cloud file management interface with CRT/DOS/ASCII art aesthetics.

## 🎮 Features

### Retro Terminal Theme
- **CRT Screen Effects**: Authentic scanlines, flicker, and glow animations
- **ASCII Art Headers**: Classic terminal-style branding
- **DOS-Style Interface**: Green-on-black color scheme with retro typography
- **Animated Elements**: Glowing borders, cursor effects, and hover animations

### Enhanced File Management
- **Folder Tree Navigation**: Hierarchical folder structure with expandable tree view
- **Smart File Icons**: Different icons for various file types (images, documents, code, etc.)
- **Advanced Search**: Real-time search across filenames and locations
- **Location-Based Filtering**: Browse files by folder structure

### Improved Upload System
- **Enhanced Upload Modal**: Complete form with progress tracking
- **File Type Support**: Accepts all file types with proper validation
- **Progress Indicators**: Real-time upload progress with visual feedback
- **Location Management**: Easy folder path specification

### File Operations
- **Preview Support**: View images and text files directly in the browser
- **Download Management**: One-click file downloads
- **Delete Confirmation**: Safe file deletion with confirmation dialogs
- **File Type Detection**: Automatic file type recognition and appropriate icons

### User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Status Indicators**: Real-time system status and file counts
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Loading States**: Visual feedback for all operations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Yarn or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CloudInterface
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
# Create .env file
VITE_ENDPOINT=your-api-endpoint
VITE_JWT_PUB_KEY=your-jwt-public-key
```

4. Start the development server:
```bash
yarn dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 🎨 Theme Customization

The CRT/DOS theme is fully customizable through CSS variables in `src/App.css`:

- **Primary Color**: `#00ff00` (Green)
- **Background**: `#000` (Black)
- **Font Family**: VT323 (Terminal font)
- **Animations**: Scanlines, flicker, glow effects

## 📁 File Structure

```
src/
├── components/
│   ├── FileManager.tsx    # Main file management interface
│   └── Login.tsx          # Authentication interface
├── contexts/
│   └── AuthContext.tsx    # Authentication state management
├── services/
│   └── api.ts            # API communication layer
├── App.css               # CRT/DOS theme styles
├── App.tsx               # Main application component
└── main.tsx              # Application entry point
```

## 🔧 API Integration

The application integrates with a REST API for:
- User authentication (login/register)
- File upload/download
- File listing and management
- File deletion

### API Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/items` - List user files
- `POST /api/items/upload` - Upload file
- `GET /api/items/{id}/file` - Download file
- `DELETE /api/items/{id}` - Delete file

## 🎯 Key Features

### Folder Management
- **Hierarchical Structure**: Files are organized by location paths
- **Tree Navigation**: Expandable folder tree for easy navigation
- **Location Filtering**: View files by specific folder locations
- **Root Access**: Access to all files from root directory

### File Operations
- **Multi-format Support**: Images, documents, code files, archives
- **Preview Capabilities**: View images and text files in browser
- **Batch Operations**: Select multiple files for operations
- **Progress Tracking**: Real-time upload and download progress

### Security
- **JWT Authentication**: Secure token-based authentication
- **File Access Control**: User-specific file access
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Graceful error handling and user feedback

## 🎮 Retro Gaming Aesthetic

The interface features authentic retro computing elements:
- **CRT Monitor Effects**: Scanlines and screen flicker
- **Terminal Typography**: Monospace fonts with glowing text
- **DOS-Style UI**: Command-line inspired interface elements
- **ASCII Art**: Classic text-based graphics and borders
- **Retro Animations**: Authentic 80s/90s computer aesthetics

## 📱 Responsive Design

The interface adapts to different screen sizes:
- **Desktop**: Full-featured interface with sidebar navigation
- **Tablet**: Optimized layout with collapsible panels
- **Mobile**: Touch-friendly interface with simplified navigation

## 🔮 Future Enhancements

- **File Sharing**: Share files with other users
- **File Versioning**: Track file versions and history
- **Advanced Search**: Full-text search within documents
- **Drag & Drop**: Intuitive file upload interface
- **Keyboard Shortcuts**: Power user keyboard navigation
- **Theme Customization**: Multiple retro themes (Amiga, Apple II, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Welcome to the future of retro computing!** 🖥️✨
