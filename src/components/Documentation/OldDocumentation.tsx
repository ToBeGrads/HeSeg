import { useState } from 'react'
import { FiSearch, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiMail } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../AppHeader/AppHeader'
import './Documentation.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { useTranslation } from '../../hooks/useTranslation'

const sections = [
  {
    id: 'section-1',
    title: 'Starting Pages',
    subsections: [
      { 
        id: 'sub-1', 
        title: 'Login Page', 
        content: `
          <h2>Login Page</h2>
          <p>This is the login page where users enter their credentials to access the HeSeg segmentation tool.</p>
          
          <div class="doc-image-container">
            <img src="/images/login-english.png" alt="Login Page" />
            <span class="doc-image-caption">Figure 1: Login page interface</span>
          </div>
          
          <h3>How to Login</h3>
          <div class="doc-steps">
            <div class="doc-step">
              <span class="step-number">1</span>
              <div class="step-content">
                <strong>Enter Username</strong>
                <p>Type your assigned username (email address) in the first field.</p>
              </div>
            </div>
            <div class="doc-step">
              <span class="step-number">2</span>
              <div class="step-content">
                <strong>Enter Password</strong>
                <p>Type your password in the second field. The password is hidden for security.</p>
              </div>
            </div>
            <div class="doc-step">
              <span class="step-number">3</span>
              <div class="step-content">
                <strong>Click Login</strong>
                <p>Press the <code>Login</code> button to access the application.</p>
              </div>
            </div>
          </div>
          
          <div class="doc-note">
            <div class="doc-note-icon">📝</div>
            <div class="doc-note-content">
              <strong>Note:</strong> Your credentials are provided by the system administrator. Contact them if you haven't received your login details.
            </div>
          </div>
          
          <h3>Language Selection</h3>
          <p>You can switch between <strong>English</strong> and <strong>French</strong> using the language selector in the top-right corner of the login page.</p>
          
          
          <div class="doc-tip">
            <div class="doc-tip-icon">💡</div>
            <div class="doc-tip-content">
              <strong>Tip:</strong> The application will remember your language preference for future sessions.
            </div>
          </div>
          <h3>Access to Documentation</h3>
          <p>You can access to the documentation section by cliking on the <strong>Question Mark Button</strong> in the top-most right corner of the login page.</p>
          
          <h3>Troubleshooting Login Issues</h3>
          <table>
            <thead>
              <tr>
                <th>Problem</th>
                <th>Solution</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Invalid credentials error</td>
                <td>Double-check your username and password. Ensure Caps Lock is off.</td>
              </tr>
              <tr>
                <td>Forgot password</td>
                <td>Contact your system administrator to reset your password.</td>
              </tr>
              <tr>
                <td>Page not loading</td>
                <td>Check your internet connection and try refreshing the page.</td>
              </tr>
            </tbody>
          </table>
          
          <div class="doc-warning">
            <div class="doc-warning-icon">⚠️</div>
            <div class="doc-warning-content">
              <strong>Warning:</strong> Do not share your login credentials with others. Each user should have their own account.
            </div>
          </div>
        `
      },
      { 
        id: 'sub-2', 
        title: 'Main Menu', 
        content: `
          <h2>Main Menu</h2>
          <p>After successful login, you will be directed to the main menu where you can access different features of the application.</p>
          
          <div class="doc-image-container">
            <img src="/images/mainMenu-english.png" alt="Main Menu" />
            <span class="doc-image-caption">Figure 2: Main menu interface</span>
          </div>
          
          <h3>Available Options</h3>
          <div class="doc-feature-grid">
            <div class="doc-feature-card">
              <div class="feature-icon">📝</div>
              <h4>Segment</h4>
              <p>Access the MRI segmentation workspace to view and segment brain scans.</p>
            </div>
            <div class="doc-feature-card">
              <div class="feature-icon">📖</div>
              <h4>Documentation</h4>
              <p>Access this help documentation for guidance on using HeSeg.</p>
            </div>
          </div>
          
          <h3>Navigation Elements</h3>
          <ul>
            <li><strong>Header Bar:</strong> Contains language switcher and help button</li>
            <li><strong>Logout Button:</strong> Click to securely log out of your account</li>
            <li><strong>Option Cards:</strong> Click any card to navigate to that feature</li>
          </ul>
        `
      },
      { 
        id: 'sub-3', 
        title: 'Segment List Page', 
        content: `
          <h2>Segment List Page</h2>
          <p>After clicking on the <strong>Segment Option</strong> in the Main Menu you will be directed to this page.</p>
          
          <div class="doc-image-container">
            <img src="/images/segmentList-english.png" alt="Segment Cases List" />
            <span class="doc-image-caption">Figure 3: Segment Cases List page interface</span>
          </div>
          
          <div class="doc-note">
            <div class="doc-note-icon">📝</div>
            <div class="doc-note-content">
              <strong>Note:</strong> Each annotator will be assigned a list of MRI images to segment based on their user account.
            </div>
          </div>
          
          <h3>Table Description</h3>
          <table>
            <thead>
              <tr>
                <th>Column</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Gender</strong></td>
                <td>Gender of the patient (Male or Female)</td>
              </tr>
              <tr>
                <td><strong>Age</strong></td>
                <td>Age of the patient in years</td>
              </tr>
              <tr>
                <td><strong>Modality</strong></td>
                <td>Type of MRI image used for segmentation (T1 or T2 weighted)</td>
              </tr>
              <tr>
                <td><strong>Last Modified</strong></td>
                <td>Records the last time the annotator modified the segmentation of this specific MRI image</td>
              </tr>
            </tbody>
          </table>
          
          <div class="doc-note">
            <div class="doc-note-icon">📝</div>
            <div class="doc-note-content">
              <strong>Note:</strong> The MRI images are ordered chronologically by the last modified date. The most recently modified MRI image will appear at the top of the list.
            </div>
          </div>
        `
      }
    ]

  },
  {
    id: 'section-2',
    title: 'MRI Viewer',
    subsections: [
      { 
        id: 'viewer-1', 
        title: 'Main Overview', 
        content: `
          <h2>Main Overview</h2>
          <p>The MRI viewer is the main workspace for viewing and segmenting brain scans. It provides a comprehensive set of tools for navigating, analyzing, and annotating medical images.</p>
          
          <div class="doc-image-container">
            <img src="/images/mriViewer/mainView-english.png" alt="MRI Viewer Main Interface" />
            <span class="doc-image-caption">Figure 4: MRI Main Viewer page interface</span>
          </div>
          
          <h3>Interface Components</h3>
          <ul>
            <li><strong>Header Bar:</strong> Green toolbar at the top containing view mode buttons, volume dimensions, settings, and ruler tool. <a href="#viewer-2" class="doc-link">→ See Header Bar</a></li>
            <li><strong>Viewer Area:</strong> Main display area showing MRI slices with zoom, pan, and slice navigation controls. <a href="#viewer-5" class="doc-link">→ See View Modes</a></li>
            <li><strong>Sidebar:</strong> Left panel containing structure list, coordinates, and segmentation controls. <a href="#viewer-3" class="doc-link">→ See Sidebar</a></li>
            
          </ul>
          
          
        `
      },
      { 
        id: 'viewer-2', 
        title: 'Header Bar', 
        nestedSections: [
          { id: 'header-settings', title: 'Settings' },
          
        ],
        content: `
          <h2>Header Bar</h2>
          <p>The Header Bar is the green toolbar at the top of the viewer. It contains three main sections: <strong>Left</strong> (MRI information), <strong>Middle</strong> (view settings), and <strong>Right</strong> (additional settings and tools).</p>
          
          <div class="doc-image-container">
            <img src="/images/mriViewer/headerBar-english.png" alt="Header Bar Interface" />
            <span class="doc-image-caption">Figure 5: Header Bar with its three sections</span>
          </div>
          
          <h3>Left Section — MRI Information</h3>
          <p>Displays information about the currently loaded MRI scan:</p>
          <ul>
            <li><strong>MRI Viewer:</strong> Title of the tool section</li>
            <li><strong>(232 × 256 × 80):</strong> MRI dimensions in X, Y, and Z axes (width, height, and depth in voxels)</li>
            <li><strong>(104, 97, 40):</strong> Current voxel coordinates where the cursor is pointing on the MRI image</li>
            <li><strong>0.90 × 0.90 × 2.00 mm:</strong> Voxel spacing (distance between slices in Sagittal, Coronal, and Axial orientations)</li>
          </ul>
          
          <div class="doc-tip">
            <div class="doc-tip-icon">💡</div>
            <div class="doc-tip-content">
              <strong>Tip:</strong> The voxel coordinates update in real-time as you move your cursor over the MRI image.
            </div>
          </div>
          
          <h3>Middle Section — View Settings</h3>
          <p>Controls for changing how the MRI is displayed:</p>
          <ul>
            <li>
              
              <strong>Single View</strong><span class="doc-icon-btn"><img src="/images/icons/square.svg" alt="Single View" /></span>: Display one orientation at a time 
              <a href="#single-view" class="doc-link">→ See Single View</a>
            </li>
            <li>
              
              <strong>Quad View</strong><span class="doc-icon-btn"><img src="/images/icons/grid.svg" alt="Quad View" /></span>: Display all three orientations plus 3D view 
              <a href="#quad-view" class="doc-link">→ See Quad View</a>
            </li>
            <li>
              
              <strong>Mosaic View</strong><span class="doc-icon-btn"><img src="/images/icons/eye.svg" alt="Mosaic View" /></span>: Display multiple slices in a grid 
              <a href="#mosaic-view" class="doc-link">→ See Mosaic View</a>
            </li>
          </ul>
          
          <h3>Right Section — Tools & Settings</h3>
          <p>Additional tools and configuration options:</p>
          <ul>
            <li>
              
              <strong>Ruler Tool</strong><span class="doc-icon-btn"><img src="/images/icons/ruler-3.svg" alt="Ruler" class="rotate-90" /></span>: Measure distances between two points on the MRI 
              <a href="#viewer-6" class="doc-link">→ See Ruler Tool</a>
            </li>
            <li>
              
              <strong>Settings</strong><span class="doc-icon-btn"><img src="/images/icons/settings.svg" alt="Settings" /></span>: Adjust brightness, contrast, and crosshair visibility 
              <a href="#header-settings" class="doc-link">→ See Settings</a>
            </li>
          </ul>
          
          <div class="doc-note">
            <div class="doc-note-icon">📝</div>
            <div class="doc-note-content">
              <strong>Note:</strong> The Header Bar is always visible regardless of which view mode you are using.
            </div>
          </div>
          <div class="doc-note">
            <div class="doc-note-icon">📝</div>
            <div class="doc-note-content">
              <strong>Note:</strong> Hovering over any button will display a tooltip with its name and function.
            </div>
          </div>
          <!-- Settings Subsection -->
          <div id="header-settings" class="doc-subsection">
            <h2>Settings</h2>
            <p>The Settings panel allows you to adjust the display properties of the MRI viewer.</p>
            
            <div class="doc-image-container">
              <img src="/images/mriViewer/settings-english.png" alt="Settings Panel" />
              <span class="doc-image-caption">Figure 6: Settings panel expanded</span>
            </div>
            <h3>Settings Options</h3>
          
          <ul>
            <li><strong>Brightness:</strong> Controls the intensity of the MRI image. Default is 50%, which represents the normal display.</li>
            <li><strong>Contrast:</strong> Adjusts the difference between light and dark areas in the MRI image. Default is 50%.</li>
            <li><strong>Crosshair:</strong> Displays two diagonal lines crossing at the cursor point. Disabled by default.</li>
          </ul>
          <div class="doc-image-container">
              <img src="/images/mriViewer/exampleSettings-english.png" alt="Example Settings" />
              <span class="doc-image-caption">Figure 7: Example Settings</span>
            </div>
          <div class="doc-note">
            <div class="doc-note-icon">📝</div>
            <div class="doc-note-content">
              <strong>Note:</strong> Brightness and Contrast settings are editable only on <strong>single view mode</strong>.
            </div>
          </div>
        `
      },
      {
        id: 'viewer-3', 
        title: 'Side Bar', 
        nestedSections: [
          { id: 'sidebar-add-structure', title: 'Add Structure' },
          { id: 'sidebar-structure-item', title: 'Structure Item' },
        ],
        content: `
          <h2>Side Bar</h2>
          <p>The Side Bar is located on the left side of the MRI viewer. It provides access to structure management, segmentation tools, and additional settings.</p>
          
          <div class="doc-image-container">
            <img src="/images/mriViewer/sideBar-english.png" alt="Side Bar Interface" />
            <span class="doc-image-caption">Figure 8: Side Bar interface</span>
          </div>
          
          <h3>Top Section — Structure Management</h3>
          <p>Contains the title "Structures" and tools for managing brain structures to be segmented:</p>
          <ul>
            <li>
              <strong>Title:</strong> Displays "Structures" as the section header
            </li>
            <li>
              <strong>Add Button</strong>
              <img src="/images/icons/plus.svg" alt="Add" style="filter: brightness(0) invert(1); border: none;" />
              : Opens a modal to add a new structure for segmentation
              <a href="#sidebar-add-structure" class="doc-link">→ See Add Structure</a>
            </li>
          </ul>
          
          <h3>Middle Section — Structure List</h3>
          <p>Displays all structures that have been added for segmentation:</p>
          <ul>
            <li><strong>Structure Items:</strong> Each added structure appears as a collapsible item with its color indicator, name, and action buttons
              <a href="#sidebar-structure-item" class="doc-link">→ See Structure Item</a>
            </li>
            <li><strong>Toggle Button:</strong> The half-circle green button on the right edge toggles the sidebar visibility (show/hide)</li>
          </ul>
          
          <div class="doc-tip">
            <div class="doc-tip-icon">💡</div>
            <div class="doc-tip-content">
              <strong>Tip:</strong> Click the green half-circle button to collapse the sidebar and gain more viewing space for the MRI images.
            </div>
          </div>
          
          <h3>Bottom Section — Quick Access</h3>
          <p>Contains utility buttons for additional features:</p>
          <ul>
            <li>
              <strong>Language Switcher:</strong> Toggle between English and French interface
            </li>
            <li>
              <strong>Help Button In green</strong>
              
              : Opens this documentation page for the MRI viewer
            </li>
          </ul>
          
          <!-- Add Structure Subsection -->
          <div id="sidebar-add-structure" class="doc-subsection">
            <h2>Add Structure</h2>
            <p>The Add Structure modal allows you to create a new brain structure for segmentation.</p>
            
            <div class="doc-image-container">
              <img src="/images/mriViewer/addStructure-english.png" alt="Add Structure Modal" />
              <span class="doc-image-caption">Figure 9: Add Structure modal</span>
            </div>
            
            <h3>How to Add a Structure</h3>
            <div class="doc-steps">
              <div class="doc-step">
                <span class="step-number">1</span>
                <div class="step-content">
                  <strong>Open Modal</strong>
                  <p>Click the <span style="font-size: 1.2rem; font-weight: bold; color: white;">+</span> button</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">2</span>
                <div class="step-content">
                  <strong>Select Structure</strong>
                  <p>Choose a brain structure from the dropdown list (e.g., STN, GPi, RN).</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">3</span>
                <div class="step-content">
                  <strong>Choose Color</strong>
                  <p>Select a color for the segmentation mask from the available color palette.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">4</span>
                <div class="step-content">
                  <strong>Confirm</strong>
                  <p>Click "Add Structure" to create the structure. It will appear in the sidebar list.</p>
                </div>
              </div>
            </div>
            
            <div class="doc-note">
              <div class="doc-note-icon">📝</div>
              <div class="doc-note-content">
                <strong>Note:</strong> Each color can only be used once. Already used colors will appear disabled in the color palette.
              </div>
            </div>
          </div>
          
          <!-- Structure Item Subsection -->
          <div id="sidebar-structure-item" class="doc-subsection">
            <h2>Structure Item</h2>
            <p>Each structure in the sidebar has its own item with controls for managing coordinates and segmentation.</p>
            
            <div class="doc-image-container">
              <img src="/images/mriViewer/structureItem-english.png" alt="Structure Item" />
              <span class="doc-image-caption">Figure 10: Structure item expanded</span>
            </div>
            
            <h3>Structure Item Components</h3>
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Color Indicator</strong></td>
                  <td>Shows the assigned color for this structure's segmentation mask</td>
                </tr>
                <tr>
                  <td><strong>Structure Name</strong></td>
                  <td>Displays the name of the brain structure (e.g., STN, GPi)</td>
                </tr>
                <tr>
                  <td><strong>Visibility Toggle</strong></td>
                  <td>Show or hide the segmentation mask overlay on the MRI</td>
                </tr>
                <tr>
                  <td><strong>Edit Button</strong></td>
                  <td>Enter mask editing mode to manually refine the segmentation</td>
                </tr>
                <tr>
                  <td><strong>Expand/Collapse</strong></td>
                  <td>Click to show or hide the coordinates list</td>
                </tr>
              </tbody>
            </table>
            
            <h3>Coordinates Management</h3>
            <p>When expanded, the structure item shows two sections:</p>
            
            <h4>Active Points</h4>
            <ul>
              <li><strong>Add Point Button</strong> <img src="/images/icons/plus.svg" alt="Add" style="filter: brightness(0) invert(1); border: none;" />: Enter placement mode to add a new coordinate point</li>
              <li><strong>Point List:</strong> Shows all points that have not been segmented yet</li>
              <li><strong>Generate Button</strong> <img src="/images/icons/star.svg" alt="Generate" style="filter: brightness(0) invert(1); border: none;" />: Generate AI segmentation for a specific point</li>
              <li><strong>Batch Generate:</strong> Select multiple points and generate segmentation for all at once</li>
            </ul>
            
            <h4>Segmented Points</h4>
            <ul>
              <li><strong>Completed Points:</strong> Shows all points that have been successfully segmented</li>
              <li><strong>Orientation Badge:</strong> Displays the orientation (Ax/Co/Sa) where the point was placed</li>
              <li><strong>Navigate:</strong> Click on any point to jump to that exact location in the MRI</li>
            </ul>
            
            <div class="doc-tip">
              <div class="doc-tip-icon">💡</div>
              <div class="doc-tip-content">
                <strong>Tip:</strong> Clicking on a coordinate point will automatically navigate to the correct slice and orientation, with 400% zoom for precise viewing.
              </div>
            </div>
          </div>
        `
      },
      {
        id: 'viewer-4', 
        title: 'Segmentation', 
        nestedSections: [
          { id: 'segmentation-toolbar', title: 'Segmentation Toolbar' },
          { id: 'segmentation-coordinates', title: 'Coordinate Segmentation' },
        ],
        content: `
          <h2>Segmentation</h2>
          <p>Segmentation is the process of identifying and delineating specific brain structures in MRI images. HeSeg provides two main methods for segmentation: manual editing with the toolbar and AI-assisted coordinate-based segmentation.</p>
          
          <div class="doc-image-container">
            <img src="/images/mriViewer/structureItem-english.png" alt="Segmentation Overview" />
            <span class="doc-image-caption">Figure 11: Segmentation in action</span>
          </div>
          
          <h3>Segmentation Methods</h3>
          <ul>
            <li>
              <strong>Manual Editing:</strong> Use the segmentation toolbar to draw or erase mask regions directly on the MRI slices
              <a href="#segmentation-toolbar" class="doc-link">→ See Segmentation Toolbar</a>
            </li>
            <li>
              <strong>AI-Assisted:</strong> Place coordinate points and let the SAM (Segment Anything Model) make the segmentation automatically
              <a href="#segmentation-coordinates" class="doc-link">→ See Coordinate Segmentation</a>
            </li>
          </ul>
          
          <div class="doc-tip">
            <div class="doc-tip-icon">💡</div>
            <div class="doc-tip-content">
              <strong>Tip:</strong> For best results, use AI-assisted segmentation first, then refine the mask manually with the toolbar.
            </div>
          </div>
          
          <!-- Segmentation Toolbar Subsection -->
          <div id="segmentation-toolbar" class="doc-subsection">
            <h2>Segmentation Toolbar</h2>
            <p>The Segmentation Toolbar appears when you enter editing mode for a structure. It provides tools for manually drawing and refining segmentation masks.</p>
            
            <div class="doc-image-container">
              <img src="/images/mriViewer/segmentationTool-english.png" alt="Segmentation Toolbar" />
              <span class="doc-image-caption">Figure 12: Segmentation Toolbar</span>
            </div>
            
            <h3>Toolbar Components</h3>
            <table>
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>Icon</th>
                  <th>Description</th>
                  <th>Shortcut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Draw</strong></td>
                  <td><span style="font-size: 1.1rem;">✏️</span></td>
                  <td>Add to the segmentation mask by drawing on the image</td>
                  <td><kbd>D</kbd></td>
                </tr>
                <tr>
                  <td><strong>Erase</strong></td>
                  <td><span style="font-size: 1.1rem;">🧹</span></td>
                  <td>Remove parts of the segmentation mask</td>
                  <td><kbd>E</kbd></td>
                </tr>
                <tr>
                  <td><strong>Brush Size</strong></td>
                  <td><span style="font-size: 1.1rem;">◯</span></td>
                  <td>Adjust the size of the drawing/erasing brush (1-20)</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td><strong>Undo</strong></td>
                  <td><span style="font-size: 1.1rem;">↩️</span></td>
                  <td>Undo the last drawing action</td>
                  <td><kbd>Ctrl</kbd> + <kbd>Z</kbd></td>
                </tr>
                <tr>
                  <td><strong>Redo</strong></td>
                  <td><span style="font-size: 1.1rem;">↪️</span></td>
                  <td>Redo the previously undone action</td>
                  <td><kbd>Ctrl</kbd> + <kbd>Y</kbd></td>
                </tr>
                <tr>
                  <td><strong>Previous Slice</strong></td>
                  <td><span style="font-size: 1.1rem;">⬅️</span></td>
                  <td>Navigate to the previous slice</td>
                  <td><kbd>←</kbd></td>
                </tr>
                <tr>
                  <td><strong>Next Slice</strong></td>
                  <td><span style="font-size: 1.1rem;">➡️</span></td>
                  <td>Navigate to the next slice</td>
                  <td><kbd>→</kbd></td>
                </tr>
                <tr>
                  <td><strong>Complete</strong></td>
                  <td><span style="font-size: 1.1rem;">✓</span></td>
                  <td>Finish editing and save the mask</td>
                  <td><kbd>Enter</kbd></td>
                </tr>
              </tbody>
            </table>
            <div class="doc-note">
              <div class="doc-note-icon">📝</div>
              <div class="doc-note-content">
                <strong>Note:</strong> <strong>The redo and undo history</strong> is sepcific to each structure being edited and for each slice.
              </div>
            </div>
            
            <h3>How to Use the Toolbar</h3>
            <div class="doc-steps">
              <div class="doc-step">
                <span class="step-number">1</span>
                <div class="step-content">
                  <strong>Enter Edit Mode</strong>
                  <p>Click the edit button (✏️) on a structure in the sidebar to open the toolbar.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">2</span>
                <div class="step-content">
                  <strong>Select Tool</strong>
                  <p>Choose Draw <kbd>D</kbd> to add to the mask or Erase <kbd>E</kbd> to remove.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">3</span>
                <div class="step-content">
                  <strong>Adjust Brush Size</strong>
                  <p>Use the slider to set the brush size for precise or broad strokes.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">4</span>
                <div class="step-content">
                  <strong>Draw on Image</strong>
                  <p>Click and drag on the MRI image to draw or erase the mask.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">5</span>
                <div class="step-content">
                  <strong>Navigate Slices</strong>
                  <p>Use the arrow buttons or keyboard arrows to move between slices while editing.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">6</span>
                <div class="step-content">
                  <strong>Complete Editing</strong>
                  <p>Click the checkmark (✓) or press <kbd>Enter</kbd> to save and exit edit mode.</p>
                </div>
              </div>
            </div>
            
            <h3>Video Tutorial</h3>
            <div class="doc-video-container">
              <video controls width="100%">
                <source src="/videos/mriViewer/segmentationTool-english.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
              <span class="doc-video-caption">Video 1: Using the Segmentation Toolbar</span>
            </div>
            
            <div class="doc-note">
              <div class="doc-note-icon">📝</div>
              <div class="doc-note-content">
                <strong>Note:</strong> Changes are automatically saved when you navigate between slices. Use Undo <kbd>Ctrl</kbd> + <kbd>Z</kbd> if you make a mistake.
              </div>
            </div>
          </div>
          
          <!-- Coordinate Segmentation Subsection -->
          <div id="segmentation-coordinates" class="doc-subsection">
            <h2>Coordinate Segmentation</h2>
            <p>Coordinate-based segmentation uses AI (SAM - Segment Anything Model) to automatically generate masks based on points you place on the MRI image.</p>
            
            
            
            <h3>How It Works</h3>
            <div class="doc-feature-grid">
              <div class="doc-feature-card">
                <div class="feature-icon">📍</div>
                <h4>1. Place Point</h4>
                <p>Click on the structure you want to segment to place a coordinate point.</p>
              </div>
              <div class="doc-feature-card">
                <div class="feature-icon">🤖</div>
                <h4>2. AI Processing</h4>
                <p>The SAM model analyzes the image and generates a segmentation mask.</p>
              </div>
              <div class="doc-feature-card">
                <div class="feature-icon">✨</div>
                <h4>3. View Result</h4>
                <p>The generated mask is displayed and can be refined manually.</p>
              </div>
            </div>
            
            <h3>Step-by-Step Guide</h3>
            <div class="doc-steps">
              <div class="doc-step">
                <span class="step-number">1</span>
                <div class="step-content">
                  <strong>Select Structure</strong>
                  <p>Choose or create a structure in the sidebar that you want to segment.</p>
                </div>
              </div>
              
              <div class="doc-step">
                <span class="step-number">2</span>
                <div class="step-content">
                  <strong>Add Coordinate Point</strong>
                  <p>Click the <span style="font-size: 1.2rem; font-weight: bold;">+</span> button next to "Active Points" in the structure item.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">3</span>
                <div class="step-content">
                  <strong>Navigate to Target</strong>
                  <p>Navigate to the slice where you want to place the point using scroll or arrow keys.</p>
                </div>
              </div>
              <div class="doc-image-container">
              <img src="/images/mriViewer/selectPoint-english.png" alt="Coordinate Pointing" />
              <span class="doc-image-caption">Figure 13: Select Point</span>
            </div>
              <div class="doc-step">
                <span class="step-number">4</span>
                <div class="step-content">
                  <strong>Place the Point</strong>
                  <p>Click on the center of the structure you want to segment. A crosshair will appear.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">5</span>
                <div class="step-content">
                  <strong>Confirm Point</strong>
                  <p>Click "Save" to confirm the point placement. The point will appear in the Active Points list.</p>
                </div>
              </div>
              <div class="doc-image-container">
              <img src="/images/mriViewer/confrimPoint-english.png" alt="Confirm Point" />
              <span class="doc-image-caption">Figure 12: Confrim Point</span>
            </div>
              <div class="doc-step">
                <span class="step-number">6</span>
                <div class="step-content">
                  <strong>Generate Segmentation</strong>
                  <p>Click the star (⭐) button next to the point to generate the AI segmentation.</p>
                </div>
              </div>
              <div class="doc-image-container">
              <img src="/images/mriViewer/generate-english.png" alt="Generate Segmentation" />
              <span class="doc-image-caption">Figure 14: Generate Segmentation</span>
            </div>
              <div class="doc-step">
                <span class="step-number">7</span>
                <div class="step-content">
                  <strong>Review & Refine</strong>
                  <p>Once generated, the mask appears on the MRI. Use the toolbar to refine if needed.</p>
                </div>
              </div>
              <div class="doc-image-container">
              <img src="/images/mriViewer/refine-english.png" alt="Refine Segmentation" />
              <span class="doc-image-caption">Figure 15: Refine and Edit The Segmentation</span>
            </div>
            </div>
            9
            
            <h3>Video Tutorial</h3>
            <div class="doc-video-container">
              <video controls width="100%">
                <source src="/videos/mriViewer/samSegmentation-english.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <span class="doc-video-caption">Video 2: Coordinate-based Segmentation with AI</span>
            </div>
            
            <div class="doc-tip">
              <div class="doc-tip-icon">💡</div>
              <div class="doc-tip-content">
                <strong>Tip:</strong> Place points in the center of the structure for best AI segmentation results. Avoid placing points on edges or boundaries.
              </div>
            </div>
            <div class="doc-note">
              <div class="doc-note-icon">📝</div>
              <div class="doc-note-content">
                <strong>Note:</strong> The segmentation can be also done in <strong>Sagittal</strong> and <strong>Coronal</strong> views, not only in Axial.
              </div>
            </div>
          </div>
        `
      },
      {
        id: 'viewer-5', 
        title: 'Views', 
        nestedSections: [
          { id: 'single-view', title: 'Single View' },
          { id: 'quad-view', title: 'Quad View' },
          { id: 'mosaic-view', title: 'Mosaic View' },
          { id: '3d-view', title: '3D Reconstruction' },
        ],
        content: `
          <h2>Views</h2>
          <p>HeSeg provides multiple view modes to visualize MRI images from different perspectives. Each view mode is designed for specific tasks and workflows.</p>
          
          
          
          <h3>Available View Modes</h3>
          <table>
            <thead>
              <tr>
                <th>View Mode</th>
                <th>Shortcut</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Single View</strong></td>
                <td><kbd>1</kbd></td>
                <td>Display one orientation at a time (Axial, Coronal, or Sagittal)</td>
              </tr>
              <tr>
                <td><strong>Quad View</strong></td>
                <td><kbd>4</kbd></td>
                <td>Display all three orientations plus 3D view simultaneously</td>
              </tr>
              <tr>
                <td><strong>Mosaic View</strong></td>
                <td><kbd>M</kbd></td>
                <td>Display multiple slices in a grid for quick overview</td>
              </tr>
              <tr>
                <td><strong>3D View</strong></td>
                <td><kbd>3</kbd></td>
                <td>Display 3D reconstruction of segmented structures</td>
              </tr>
            </tbody>
          </table>
          
          <div class="doc-tip">
            <div class="doc-tip-icon">💡</div>
            <div class="doc-tip-content">
              <strong>Tip:</strong> Use keyboard shortcuts to quickly switch between view modes. Press <kbd>1</kbd>, <kbd>4</kbd>, <kbd>M</kbd>, or <kbd>3</kbd> at any time.
            </div>
          </div>
          
          <!-- Single View Subsection -->
          <div id="single-view" class="doc-subsection">
            <h2>Single View</h2>
            <p>Single View displays one orientation at a time, providing a larger and more detailed view of the MRI slices. This is the default view mode.</p>
            
            <div class="doc-image-container">
              <img src="/images/mriViewer/singleView-english.png" alt="Single View" />
              <span class="doc-image-caption">Figure 15: Single View mode showing Axial orientation</span>
            </div>
            
            <h3 style="display: inline-flex; align-items: center; gap: 0.5rem;">Orientations <span class="idc-circle">1</span></h3>
            <table>
              <thead>
                <tr>
                  <th>Orientation</th>
                  <th>Description</th>
                  <th>Best For</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Axial</strong></td>
                  <td>Horizontal slices (top-down view)</td>
                  <td>Viewing left-right symmetry</td>
                </tr>
                <tr>
                  <td><strong>Coronal</strong></td>
                  <td>Frontal slices (front-to-back view)</td>
                  <td>Viewing depth of structures</td>
                </tr>
                <tr>
                  <td><strong>Sagittal</strong></td>
                  <td>Side slices (left-to-right view)</td>
                  <td>Viewing midline structures</td>
                </tr>
              </tbody>
            </table>
            
            <h3>How to Switch Orientations</h3>
            <div class="doc-steps">
              <div class="doc-step">
                <span class="step-number">1</span>
                <div class="step-content">
                  <strong>Click Orientation Selector</strong>
                  <p>Click the dropdown button showing the current orientation (e.g., "Axial") at the bottom of the viewer.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">2</span>
                <div class="step-content">
                  <strong>Select Orientation</strong>
                  <p>Choose Axial, Coronal, or Sagittal from the dropdown menu.</p>
                </div>
              </div>
            </div>
            
            <h3>Navigation Controls</h3>
            <ul>
              <li><strong>Scroll Wheel <span class="idc-circle">2</span> :</strong> Navigate through slices</li>
              <li><strong>Arrow Keys <span class="idc-circle">3</span> :</strong> <kbd>↑</kbd><kbd>↓</kbd> for Axial, <kbd>←</kbd><kbd>→</kbd> for Coronal</li>
              <li><strong>Zoom <span class="idc-circle">4</span> :</strong> <kbd>Ctrl</kbd> + Scroll to zoom in up to <strong>30</strong> times /out</li>
              <li><strong>3D <span class="idc-circle">5</span> :</strong> Open a mini 3D navigator indicating the current 3D position on the brain</li>
              <div class="doc-image-container">
              <img src="/images/mriViewer/mini3D-english.png" alt="Mini 3D Navigator" />
              <span class="doc-image-caption">Figure 16: Mini 3D Navigator opened</span>
            </div>
              <li><strong>Current Coordinates</strong> <span class="idc-circle">6</span>: <strong>(x, y)</strong> for Axial, <strong>(x, z)</strong> for Coronal, <strong>(y, z)</strong> for Sagittal views</li>
              <li><strong>Slice Dimension</strong> <span class="idc-circle">7</span>: <strong>(width, height)</strong> for Axial, <strong>(width, depth)</strong> for Coronal, <strong>(height, depth)</strong> for Sagittal views</li>
            </ul>
            
            <div class="doc-note">
              <div class="doc-note-icon">📝</div>
              <div class="doc-note-content">
                <strong>Note:</strong> Single View provides the largest viewing area and is recommended for detailed segmentation work.
              </div>
            </div>
          </div>
          
          <!-- Quad View Subsection -->
          <div id="quad-view" class="doc-subsection">
            <h2>Quad View</h2>
            <p>Quad View displays all three orientations (Axial, Coronal, Sagittal) plus a 3D reconstruction view and simultaneously in a 4-panel layout.</p>
            
            <div class="doc-image-container">
              <img src="/images/mriViewer/quadView-english.png" alt="Quad View" />
              <span class="doc-image-caption">Figure 16: Quad View showing all orientations and 3D</span>
            </div>
            
            <h3>Panel Layout</h3>
            <table>
              <thead>
                <tr>
                  
                  <th>Panel</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                 
                  <td>Axial</td>
                  <td>Horizontal slices (top-down view)</td>
                </tr>
                <tr>
                 
                  <td>Coronal</td>
                  <td>Frontal slices (front-to-back view)</td>
                </tr>
                <tr>
                  
                  <td>Sagittal</td>
                  <td>Side slices (left-to-right view)</td>
                </tr>
                <tr>
                  
                  <td>3D Reconstruction</td>
                  <td>3D reconstruction of segmented structures</td>
                </tr>
              </tbody>
            </table>
            
            <h3>Features</h3>
            <ul>
              <li><strong>Synchronized Navigation:</strong> Clicking on one panel updates the crosshair position in all panels</li>
              <li><strong>Independent Scrolling:</strong> Each panel can be scrolled independently</li>
              <li><strong>Crosshair:</strong> Shows the current position across all three orientations</li>
              <li><strong>Real-time 3D:</strong> The 3D panel updates as you segment structures</li>
            </ul>
            
            <h3>How to Use Quad View</h3>
            <div class="doc-steps">
              <div class="doc-step">
                <span class="step-number">1</span>
                <div class="step-content">
                  <strong>Activate Quad View</strong>
                  <p>Press <kbd>4</kbd> or click the Quad View button in the header bar.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">2</span>
                <div class="step-content">
                  <strong>Navigate</strong>
                  <p>Click on any panel to set the crosshair position. All panels will sync to that location.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">3</span>
                <div class="step-content">
                  <strong>Scroll Slices</strong>
                  <p>Hover over a panel and use the scroll wheel to navigate through its slices.</p>
                </div>
              </div>
            </div>
            
            <div class="doc-tip">
              <div class="doc-tip-icon">💡</div>
              <div class="doc-tip-content">
                <strong>Tip:</strong> Quad View is ideal for understanding the 3D position of structures and for verifying segmentation accuracy across all orientations.
              </div>
            </div>
          </div>
          
          <!-- Mosaic View Subsection -->
          <div id="mosaic-view" class="doc-subsection">
            <h2>Mosaic View</h2>
            <p>Mosaic View displays multiple slices in a grid layout, allowing you to see an overview of the entire volume at once.</p>
            
            <div class="doc-image-container">
              <img src="/images/mriViewer/mosaic-english.png" alt="Mosaic View" />
              <span class="doc-image-caption">Figure 17: Mosaic View showing multiple slices</span>
            </div>
            
            <h3>Features</h3>
            <ul>
              <li><strong>Grid Layout:</strong> Displays slices in a scrollable grid</li>
              <li><strong>Quick Overview:</strong> See the entire volume structure at a glance</li>
              <li><strong>Slice Selection:</strong> Click on any slice to navigate to it in Single View</li>
              <li><strong>Orientation Selection:</strong> Choose which orientation to display (Axial, Coronal, or Sagittal)</li>
            </ul>
            
            <h3>How to Use Mosaic View</h3>
            <div class="doc-steps">
              <div class="doc-step">
                <span class="step-number">1</span>
                <div class="step-content">
                  <strong>Activate Mosaic View</strong>
                  <p>Press <kbd>M</kbd> or click the Mosaic View button in the header bar.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">2</span>
                <div class="step-content">
                  <strong>Select Orientation</strong>
                  <p>Use the dropdown to choose Axial, Coronal, or Sagittal orientation.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">3</span>
                <div class="step-content">
                  <strong>Browse Slices</strong>
                  <p>Scroll through the grid to view all slices in the volume.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">4</span>
                <div class="step-content">
                  <strong>Select a Slice</strong>
                  <p>Click on any slice to switch to Single View at that slice position.</p>
                </div>
              </div>
            </div>
            
            <div class="doc-note">
              <div class="doc-note-icon">📝</div>
              <div class="doc-note-content">
                <strong>Note:</strong> Mosaic View is useful for quickly finding specific slices or reviewing the overall structure and segmentation of the MRI volume.
              </div>
            </div>
          </div>
          
          <!-- 3D View Subsection -->
          <div id="3d-view" class="doc-subsection">
  <h2>3D Reconstruction</h2>
  <p>3D View displays a three-dimensional reconstruction of the segmented structures, allowing you to visualize the spatial relationships between different brain regions.</p>
  
  <div class="doc-image-container">
    <img src="/images/mriViewer/rec3D-english.png" alt="3D View" />
    <span class="doc-image-caption">Figure 18: 3D Reconstruction of segmented structures</span>
  </div>
  
  <h3>3D Controls</h3>
  <table>
    <thead>
      <tr>
        <th>Action</th>
        <th>Control</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Rotate</strong></td>
        <td>🖱️ Click and drag</td>
      </tr>
      <tr>
        <td><strong>Zoom</strong></td>
        <td>🖱️ Scroll wheel</td>
      </tr>
      <tr>
        <td><strong>Pan</strong></td>
        <td><kbd>Shift</kbd> + 🖱️ Drag</td>
      </tr>
      <tr>
        <td><strong>Reset Camera</strong></td>
        <td>Click <span class="doc-btn-inline">↺</span> button</td>
      </tr>
    </tbody>
  </table>
  
  <h3>Toolbar Buttons</h3>
  <table>
    <thead>
      <tr>
        <th>Button</th>
        <th>Name</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="doc-btn-inline">↻</span></td>
        <td><strong>Rebuild</strong></td>
        <td>Regenerate the 3D meshes from current segmentation data</td>
      </tr>
      <tr>
        <td><span class="doc-btn-inline">↺</span></td>
        <td><strong>Reset View</strong></td>
        <td>Reset camera to default position</td>
      </tr>
      <tr>
        <td><span class="doc-btn-inline">+</span></td>
        <td><strong>Zoom In</strong></td>
        <td>Zoom into the 3D scene</td>
      </tr>
      <tr>
        <td><span class="doc-btn-inline">−</span></td>
        <td><strong>Zoom Out</strong></td>
        <td>Zoom out of the 3D scene</td>
      </tr>
      <tr>
        <td><span class="doc-btn-inline">⚙</span></td>
        <td><strong>Settings</strong></td>
        <td>Open display options panel</td>
      </tr>
      <tr>
        <td><span class="doc-btn-inline">⛶</span></td>
        <td><strong>Expand</strong></td>
        <td>Toggle fullscreen 3D view</td>
      </tr>
    </tbody>
  </table>
  
  <h3>Display Options</h3>
  <div class="doc-image-container">
    <img src="/images/mriViewer/rec3DOptions-english.png" alt="3D View Options" />
    <span class="doc-image-caption">Figure 19: Options of 3D Reconstruction</span>
  </div>
  <p>Click the <span class="doc-btn-inline">⚙</span> button to open the settings panel:</p>
  <table>
    <thead>
      <tr>
        <th>Option</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Render Mode</strong></td>
        <td>
          <span class="doc-btn-inline active">Surface</span>
          <span class="doc-btn-inline">Cubes</span>
          <span class="doc-btn-inline">Points</span>
        </td>
      </tr>
      <tr>
        <td><strong>Show Axes</strong></td>
        <td> Display X, Y, Z axes for orientation</td>
      </tr>
      <tr>
        <td><strong>Show Grid</strong></td>
        <td> Display reference grid on the floor</td>
      </tr>
      <tr>
        <td><strong>Bounding Box</strong></td>
        <td> Show the volume boundaries</td>
      </tr>
      <tr>
        <td><strong>Brain Outline</strong></td>
        <td> Show semi-transparent brain surface</td>
      </tr>
      <tr>
        <td><strong>Wireframe</strong></td>
        <td> Display structures as wireframe mesh</td>
      </tr>
      <tr>
        <td><strong>Structure Opacity</strong></td>
        <td><span class="doc-slider">━━━━●━━</span> Adjust transparency (0% - 100%)</td>
      </tr>
    </tbody>
  </table>
  
  <h3>Camera Presets</h3>
  <p>Quickly snap to standard viewing angles:</p>
  <ul>
    <li><span class="doc-btn-inline">Free</span> Freely rotate the 3D view</li>
    <li><span class="doc-btn-inline">Ax</span> <strong>Axial:</strong> View from top (looking down)</li>
    <li><span class="doc-btn-inline">Co</span> <strong>Coronal:</strong> View from front</li>
    <li><span class="doc-btn-inline">Sa</span> <strong>Sagittal:</strong> View from side</li>
  </ul>
  
  <h3>How to Use 3D View</h3>
  <div class="doc-steps">
    <div class="doc-step">
      <span class="step-number">1</span>
      <div class="step-content">
        <strong>Activate 3D View</strong>
        <p>Press <kbd>3</kbd> or click the <span class="doc-btn-inline">3D</span> button in the header. Alternatively, click the floating <span class="doc-btn-green">3D</span> button at the bottom right.</p>
      </div>
    </div>
    <div class="doc-step">
      <span class="step-number">2</span>
      <div class="step-content">
        <strong>Rotate the View</strong>
        <p>Click and drag to rotate the 3D scene and view structures from different angles.</p>
      </div>
    </div>
    <div class="doc-step">
      <span class="step-number">3</span>
      <div class="step-content">
        <strong>Adjust Display</strong>
        <p>Click the <span class="doc-btn-inline">⚙</span> button to open display options and customize the rendering.</p>
      </div>
    </div>
    <div class="doc-step">
      <span class="step-number">4</span>
      <div class="step-content">
        <strong>Use Camera Presets</strong>
        <p>Click <span class="doc-btn-inline">Ax</span>, <span class="doc-btn-inline">Co</span>, or <span class="doc-btn-inline">Sa</span> to quickly snap to standard viewing angles.</p>
      </div>
    </div>
    <div class="doc-step">
      <span class="step-number">5</span>
      <div class="step-content">
        <strong>Rebuild if Needed</strong>
        <p>Click <span class="doc-btn-inline">↻</span> to regenerate meshes if the 3D view doesn't update automatically.</p>
      </div>
    </div>
  </div>
  
  <h3>Video Tutorial</h3>
  <div class="doc-video-container">
    <video controls width="100%">
      <source src="/videos/mriViewer/rec3D-english.webm" type="video/webm" />
      Your browser does not support the video tag.
    </video>
    <span class="doc-video-caption">Video 3: Using the 3D Reconstruction View</span>
  </div>
  
  <div class="doc-tip">
    <div class="doc-tip-icon">💡</div>
    <div class="doc-tip-content">
      <strong>Tip:</strong> Enable <span class="doc-checkbox">☑</span> "Brain Outline" to see the segmented structures within the context of the whole brain volume.
    </div>
  </div>
  
  <div class="doc-note">
    <div class="doc-note-icon">📝</div>
    <div class="doc-note-content">
      <strong>Note:</strong> The 3D view updates automatically when you modify segmentation masks. Click <span class="doc-btn-inline">↻</span> Rebuild if the view doesn't update.
    </div>
  </div>
</div>
        `
      },
      {
        id: 'viewer-6', 
        title: 'Ruler Tool', 
        content: `
          <h2>Ruler Tool</h2>
          <p>The Ruler Tool allows you to measure distances between two points on the MRI image. This is useful for measuring the size of brain structures or the distance between anatomical landmarks.</p>
          
          <div class="doc-image-container">
            <img src="/images/mriViewer/ruler-english.png" alt="Ruler Tool" />
            <span class="doc-image-caption">Figure 20: Ruler Tool measuring distance on MRI</span>
          </div>
          
          <h3>Features</h3>
          <ul>
            <li><strong>Distance Measurement:</strong> Measure distances in millimeters (mm) based on voxel spacing</li>
            <li><strong>Multiple Rulers:</strong> Create multiple measurement lines on the same slice</li>
            <li><strong>Editable Endpoints:</strong> Drag ruler endpoints to adjust measurements</li>
            <li><strong>Real-time Updates:</strong> Distance updates as you move the cursor</li>
          </ul>
          
          <h3>How to Use the Ruler</h3>
          <div class="doc-steps">
            <div class="doc-step">
              <span class="step-number">1</span>
              <div class="step-content">
                <strong>Activate Ruler Tool</strong>
                <p>Click the <span class="doc-icon-btn"><img src="/images/icons/ruler-3.svg" alt="Ruler" class="rotate-90" /></span> button in the header bar. The button will highlight when active.</p>
              </div>
            </div>
            <div class="doc-step">
              <span class="step-number">2</span>
              <div class="step-content">
                <strong>Place First Point</strong>
                <p>Click on the MRI image to place the starting point of your measurement.</p>
              </div>
            </div>
            <div class="doc-step">
              <span class="step-number">3</span>
              <div class="step-content">
                <strong>Place Second Point</strong>
                <p>Move your cursor and click again to place the ending point. The ruler line and distance will appear.</p>
              </div>
            </div>
            
            <div class="doc-step">
              <span class="step-number">4</span>
              <div class="step-content">
                <strong>Read Measurement</strong>
                <p>The distance in millimeters (mm) is displayed at the center of the ruler line.</p>
              </div>
            </div>
          </div>
          
          <h3>Editing Rulers</h3>
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>How To</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Move Endpoint</strong></td>
                <td>Click and drag either endpoint (circle) to adjust the measurement</td>
              </tr>
              <tr>
                <td><strong>Add Another Ruler</strong></td>
                <td>Simply click on a new location to start another measurement</td>
              </tr>
              <tr>
                <td><strong>Delete Ruler</strong></td>
                <td>Double-click the <span class="doc-btn-inline">✕</span> button in the middle of the ruler line</td>
              </tr>
            </tbody>
          </table>
          
          
          
          <h3>Video Tutorial</h3>
          <div class="doc-video-container">
            <video controls width="100%">
              <source src="/videos/mriViewer/ruler-english.webm" type="video/webm" />
              
              Your browser does not support the video tag.
            </video>
            <span class="doc-video-caption">Video 4: Using the Ruler Tool</span>
          </div>
          
          <div class="doc-note">
            <div class="doc-note-icon">📝</div>
            <div class="doc-note-content">
              <strong>Note:</strong> Ruler lines are only visible when the Ruler Tool is toggled on. Toggle off the ruler button to hide all measurements.
            </div>
          </div>
          
          <div class="doc-warning">
            <div class="doc-warning-icon">⚠️</div>
            <div class="doc-warning-content">
              <strong>Warning:</strong> Ruler measurements are <strong>not saved</strong> after refreshing the page or closing the browser. Take screenshots if you need to preserve measurements.
            </div>
          </div>
          
          <div class="doc-tip">
            <div class="doc-tip-icon">💡</div>
            <div class="doc-tip-content">
              <strong>Tip:</strong> Measurements are calculated using the voxel spacing from the MRI file, ensuring accurate real-world distances in millimeters.
            </div>
          </div>
        `
      }
    ]
  },
  
]

export default function Documentation() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<string[]>([sections[0]?.id])
  const [expandedSubsections, setExpandedSubsections] = useState<string[]>([])
  const [activeSubsection, setActiveSubsection] = useState(sections[0]?.subsections[0]?.id)

  // Flatten subsections
  const allSubsections = sections.flatMap(s => 
    s.subsections.map(sub => ({ ...sub, sectionTitle: s.title }))
  )

  // Navigation
  const currentIndex = allSubsections.findIndex(s => s.id === activeSubsection)
  const current = allSubsections[currentIndex]
  const prev = currentIndex > 0 ? allSubsections[currentIndex - 1] : null
  const next = currentIndex < allSubsections.length - 1 ? allSubsections[currentIndex + 1] : null


  // Search
  const searchResults = searchQuery 
    ? allSubsections.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSubsection = (id: string) => {
    setExpandedSubsections(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const goTo = (id: string) => {
    setActiveSubsection(id)
    setSearchQuery('')
    const parent = sections.find(s => s.subsections.some(sub => sub.id === id))
    if (parent && !expandedSections.includes(parent.id)) {
      setExpandedSections(prev => [...prev, parent.id])
    }
  }
  // Scroll to nested section
  const scrollToNested = (parentId: string, nestedId: string) => {
    goTo(parentId)
    // Wait for content to render, then scroll
    setTimeout(() => {
      const element = document.getElementById(nestedId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
  // Handle link clicks in article content
const handleArticleClick = (e: React.MouseEvent<HTMLElement>) => {
  const target = e.target as HTMLElement
  
  // Check if clicked element is a link (a tag)
  const linkElement = target.tagName === 'A' 
    ? target 
    : target.closest('a') as HTMLElement | null
  
  if (linkElement) {
    const href = linkElement.getAttribute('href')
    
    // Only handle internal links starting with #
    if (href && href.startsWith('#')) {
      e.preventDefault()
      e.stopPropagation()
      
      const id = href.replace('#', '')
      
      // First check if it's a nested section on current page
      const nestedElement = document.getElementById(id)
      if (nestedElement) {
        nestedElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      
      // Check if it's a main subsection
      const targetSubsection = allSubsections.find(sub => sub.id === id)
      if (targetSubsection) {
        goTo(id)
        return
      }
      
      // Check if it's a nested section in another subsection
      for (const section of sections) {
        for (const sub of section.subsections) {
          if (sub.nestedSections?.some((nested: { id: string }) => nested.id === id)) {
            scrollToNested(sub.id, id)
            return
          }
        }
      }
    }
  }
}

  return (
    <div className="doc-container">
      <AppHeader showHelp={false} />
      
      <div className="doc-body">
        {/* Sidebar */}
        <aside className="doc-sidebar">
          <button className="doc-back-btn" onClick={() => navigate('/main')}>
            <FiChevronLeft /> Back
          </button>
          
          <h3>📖 Documentation</h3>
          
          {/* Search */}
          <div className="doc-search">
            <FiSearch className="doc-search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
            {/* Search Results */}
            {searchQuery && (
            <div className="doc-search-results">
              {searchResults.length > 0 ? (
                searchResults.map(r => (
                  <div key={r.id} className="doc-search-item" onClick={() => goTo(r.id)}>
                    <span className="doc-search-title">{r.title}</span>
                    <span className="doc-search-section">{r.sectionTitle}</span>
                  </div>
                ))
              ) : (
                <p className="doc-no-results">No results</p>
              )}
            </div>
          )}
          
          {/* Navigation */}
          {!searchQuery && (
            <nav className="doc-nav">
              {sections.map(section => (
                <div key={section.id} className="doc-nav-section">
                  <button 
                    className={`doc-nav-header ${expandedSections.includes(section.id) ? 'expanded' : ''}`}
                    onClick={() => toggleSection(section.id)}
                  >
                                        {section.title}
                    {expandedSections.includes(section.id) ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  
                  {expandedSections.includes(section.id) && (
                    <ul className="doc-nav-list">
                      {section.subsections.map(sub => (
                        <li key={sub.id}>
                          {/* Check if subsection has nested sections */}
                          {sub.nestedSections ? (
                            <>
                              <button
                                className={`doc-nav-link has-nested ${activeSubsection === sub.id ? 'active' : ''}`}
                                onClick={() => {
                                  goTo(sub.id)
                                  toggleSubsection(sub.id)
                                }}
                              >
                                {sub.title}
                                {expandedSubsections.includes(sub.id) ? (
                                  <FiChevronUp size={12} />
                                ) : (
                                  <FiChevronDown size={12} />
                                )}
                              </button>
                              {/* Nested subsections */}
                              {expandedSubsections.includes(sub.id) && (
                                <ul className="doc-nav-nested">
                                  {sub.nestedSections.map(nested => (
                                    <li key={nested.id}>
                                      <button
                                        className="doc-nav-nested-link"
                                        onClick={() => scrollToNested(sub.id, nested.id)}
                                      >
                                        {nested.title}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </>
                          ) : (
                            <button
                              className={`doc-nav-link ${activeSubsection === sub.id ? 'active' : ''}`}
                              onClick={() => goTo(sub.id)}
                            >
                              {sub.title}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                                      )}
                                      </div>
                                    ))}
                                  </nav>

                                )}
                                {/* Contact Us Button - ADD THIS */}
          <div className="doc-contact-section">
            <a 
              href="mailto:heseg2025@gmail.com?subject=HeSeg%20Support%20Request&body=Hello%20HeSeg%20Team,%0A%0A"
              className="doc-contact-btn"
              target="_blank"
              rel="noopener noreferrer"
              title= {t.documentation.contactHeSegSupportOnEmail}
            >
              <FiMail size={18} />
              <span>{t.documentation.contactUs}</span>
            </a>
          </div>
                              </aside>
                              
                              {/* Main Content */}
                              <main className="doc-main">
                                <div className="doc-main-scroll">
                                  {/* Breadcrumb */}
                                  <div className="doc-breadcrumb">
                                    <span>Docs</span> / <span>{current?.sectionTitle}</span> / <span className="current">{current?.title}</span>
                                  </div>
                                  
                                  {/* Article */}
                                  <article 
                                    className="doc-article"
                                    dangerouslySetInnerHTML={{ __html: current?.content || '' }}
                                    onClick={handleArticleClick}
                                  />
                                  {/* Prev / Next */}
            <div className="doc-footer-nav">
              {prev ? (
                <button className="doc-nav-btn prev" onClick={() => goTo(prev.id)}>
                  <FiChevronLeft />
                  <div>
                    <span className="label">Previous</span>
                    <span className="title">{prev.title}</span>
                  </div>
                </button>
              ) : <div />}
              
              {next ? (
                <button className="doc-nav-btn next" onClick={() => goTo(next.id)}>
                  <div>
                    <span className="label">Next</span>
                    <span className="title">{next.title}</span>
                  </div>
                  <FiChevronRight />
                </button>
              ) : <div />}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
