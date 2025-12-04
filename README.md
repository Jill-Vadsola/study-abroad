# StudyConnect - Study Abroad Networking App

A comprehensive React application designed to help international students connect, access resources, and succeed in their study abroad journey.

## 🚀 Features

### ✅ Completed MVP Features

- **User Authentication**: Login and registration with form validation
- **User Profiles**: Complete profile management with interests and languages
- **Student Networking**: Discover and connect with fellow international students
- **Resource Guides**: Access curated guides for scholarships, visa, housing, and more
- **Events & Webinars**: Browse and register for educational events
- **Job Board**: Find job and internship opportunities
- **Real-time Chat**: Messaging interface (frontend ready for Socket.IO integration)
- **Responsive Design**: Fully responsive across all devices
- **Light/Dark Theme**: Toggle between light and dark modes

## 🎨 UI/UX Features

- **Material-UI Components**: Modern, accessible design system
- **Responsive Layout**: Optimized for mobile, tablet, and desktop
- **Theme Switching**: Light and dark mode support with persistent storage
- **Smooth Animations**: Hover effects and transitions
- **Mobile-First**: Collapsible navigation and mobile-optimized layouts

## 🛠️ Tech Stack

- **Frontend**: React 18
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router DOM
- **Icons**: Material-UI Icons
- **Date Handling**: Day.js with MUI Date Pickers
- **Styling**: Emotion (CSS-in-JS)

## 📦 Installation & Setup

1. **Navigate to the project directory**

   ```bash
   cd study-abroad-app
   ```

2. **Install dependencies** (already done)

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Open the application**
   - The app will open automatically at `http://localhost:3000`
   - If it doesn't open automatically, navigate to the URL in your browser

## 📱 Available Pages

1. **Home** (`/`) - Landing page with features overview
2. **Login** (`/login`) - User authentication
3. **Register** (`/register`) - User registration with detailed form
4. **Profile** (`/profile`) - User profile management
5. **Networking** (`/networking`) - Student discovery and connections
6. **Resources** (`/resources`) - Educational guides and resources
7. **Events** (`/events`) - Event listings and registration
8. **Jobs** (`/jobs`) - Job and internship opportunities
9. **Chat** (`/chat`) - Real-time messaging interface

## 🔧 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Navbar.js       # Navigation component
├── pages/              # Page components
│   ├── Home.js
│   ├── Login.js
│   ├── Register.js
│   ├── Profile.js
│   ├── Networking.js
│   ├── Resources.js
│   ├── Events.js
│   ├── Jobs.js
│   └── Chat.js
├── contexts/           # React contexts
│   └── ThemeContext.js # Theme management
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── App.js              # Main app component
└── index.js            # App entry point
```

## 🌟 Key Components

### Navbar Component

- Responsive navigation with mobile drawer
- Theme toggle button
- Authentication links
- Company branding

### Theme System

- Light and dark mode support
- Persistent theme preferences
- Custom Material-UI theme configuration
- Responsive breakpoints

### Form Validation

- Real-time form validation
- User-friendly error messages
- Loading states and feedback

## 🎯 MVP Implementation Status

✅ **User Registration & Authentication**

- Secure sign-up and login forms
- Form validation and error handling
- Social login placeholders (Google, Facebook)

✅ **Profile-Based Networking**

- User discovery with filtering
- Connection management
- Profile viewing and details

✅ **Resource Guides**

- Categorized resource guides
- Search and filtering functionality
- Detailed guide content with expandable sections

✅ **Event & Webinar Listings**

- Event discovery and filtering
- Registration functionality
- Calendar integration ready

✅ **Job & Internship Board**

- Job listings with detailed information
- Advanced filtering options
- Application tracking

✅ **Real-Time Chat Interface**

- Chat interface ready for Socket.IO
- Mobile-responsive design
- Message history and status indicators

## 🚧 Future Enhancements (Post-MVP)

- **Backend Integration**: Connect to REST API or GraphQL backend
- **Real-time Features**: Socket.IO integration for chat and notifications
- **Advanced Search**: Elasticsearch integration
- **File Uploads**: AWS S3 integration for profile pictures and documents
- **Push Notifications**: Web push notifications
- **Advanced Analytics**: User engagement tracking
- **Mentorship System**: Advanced matching algorithms
- **Group Discussions**: Forum-style discussions
- **Language Exchange**: Advanced language learning features
- **Admin Dashboard**: Content management and analytics

## 🔒 Security Considerations

- Form validation and sanitization
- XSS protection through React's built-in security
- Prepared for JWT authentication integration
- HTTPS-ready configuration

## 📱 Mobile Responsiveness

- Mobile-first design approach
- Touch-friendly interfaces
- Optimized navigation for small screens
- Responsive grid layouts
- Mobile-specific UI patterns

## 🎨 Design System

- Consistent spacing and typography
- Accessible color schemes
- Material Design principles
- Custom theme configurations
- Dark mode optimization

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
