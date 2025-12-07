import { useState, useEffect } from 'react'
import { FiSearch, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiMail } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../AppHeader/AppHeader'
import './Documentation.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { useTranslation } from '../../hooks/useTranslation'
import { useLanguageStore } from '../../store/useLanguageStore'

export default function Documentation() {
  const { t } = useTranslation()
  const { language } = useLanguageStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<string[]>(['section-1'])
  const [expandedSubsections, setExpandedSubsections] = useState<string[]>([])
  const [activeSubsection, setActiveSubsection] = useState('sub-1')

  // Language suffix for images/videos
  const lang = language === 'fr' ? 'french' : 'english'

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (hash) {
      // Find if it's a main subsection
      const targetSubsection = allSubsections.find(sub => sub.id === hash)
      if (targetSubsection) {
        goTo(hash)
        return
      }

      // Find if it's a nested section
      for (const section of sections) {
        for (const sub of section.subsections) {
          if (sub.nestedSections?.some((nested: { id: string }) => nested.id === hash)) {
            scrollToNested(sub.id, hash)
            return
          }
        }
      }
    }
  }, [location.hash])

  const sections = [
    {
      id: 'section-1',
      title: language === 'fr' ? 'Pages de démarrage' : 'Starting Pages',
      subsections: [
        { 
          id: 'sub-1', 
          title: language === 'fr' ? 'Page de connexion' : 'Login Page', 
          content: language === 'fr' ? `
            <h2>Page de connexion</h2>
            <p>Voici la page de connexion où les utilisateurs entrent leurs identifiants pour accéder à l'outil de segmentation HeSeg.</p>
            
            <div class="doc-image-container">
              <img src="/images/login-french.png" alt="Page de connexion" />
              <span class="doc-image-caption">Figure 1 : Interface de la page de connexion</span>
            </div>
            
            <h3>Comment se connecter</h3>
            <div class="doc-steps">
              <div class="doc-step">
                <span class="step-number">1</span>
                <div class="step-content">
                  <strong>Entrer le nom d'utilisateur</strong>
                  <p>Tapez votre nom d'utilisateur assigné (adresse e-mail) dans le premier champ.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">2</span>
                <div class="step-content">
                  <strong>Entrer le mot de passe</strong>
                  <p>Tapez votre mot de passe dans le second champ. Le mot de passe est masqué pour la sécurité.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">3</span>
                <div class="step-content">
                  <strong>Cliquer sur ${t.auth.login}</strong>
                  <p>Appuyez sur le bouton <code>${t.auth.login}</code> pour accéder à l'application.</p>
                </div>
              </div>
            </div>
            
            <div class="doc-note">
              <div class="doc-note-icon">📝</div>
              <div class="doc-note-content">
                <strong>Note :</strong> Vos identifiants sont fournis par l'administrateur système. Contactez-le si vous n'avez pas reçu vos informations de connexion.
              </div>
            </div>
            
            <h3>Sélection de la langue</h3>
            <p>Vous pouvez basculer entre <strong>Anglais</strong> et <strong>Français</strong> en utilisant le sélecteur de langue dans le coin supérieur droit de la page de connexion.</p>
            
            <div class="doc-tip">
              <div class="doc-tip-icon">💡</div>
              <div class="doc-tip-content">
                <strong>Astuce :</strong> L'application mémorisera votre préférence de langue pour les sessions futures.
              </div>
            </div>
            
            <h3>Accès à la documentation</h3>
            <p>Vous pouvez accéder à la section documentation en cliquant sur le <strong>bouton Point d'interrogation</strong> dans le coin supérieur droit de la page de connexion.</p>
            
            <h3>Résolution des problèmes de connexion</h3>
            <table>
              <thead>
                <tr>
                  <th>Problème</th>
                  <th>Solution</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Erreur d'identifiants invalides</td>
                  <td>Vérifiez votre nom d'utilisateur et mot de passe. Assurez-vous que la touche Verr Maj est désactivée.</td>
                </tr>
                <tr>
                  <td>Mot de passe oublié</td>
                  <td>Contactez votre administrateur système pour réinitialiser votre mot de passe.</td>
                </tr>
                <tr>
                  <td>Page ne se charge pas</td>
                  <td>Vérifiez votre connexion Internet et essayez de rafraîchir la page.</td>
                </tr>
              </tbody>
            </table>
            
            <div class="doc-warning">
              <div class="doc-warning-icon">⚠️</div>
              <div class="doc-warning-content">
                <strong>Attention :</strong> Ne partagez pas vos identifiants de connexion avec d'autres personnes. Chaque utilisateur doit avoir son propre compte.
              </div>
            </div>
          ` : `
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
                  <strong>Click ${t.auth.login}</strong>
                  <p>Press the <code>${t.auth.login}</code> button to access the application.</p>
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
            <p>You can access the documentation section by clicking on the <strong>Question Mark Button</strong> in the top-right corner of the login page.</p>
            
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
          title: language === 'fr' ? 'Menu principal' : 'Main Menu', 
          content: language === 'fr' ? `
            <h2>Menu principal</h2>
            <p>Après une connexion réussie, vous serez dirigé vers le menu principal où vous pouvez accéder aux différentes fonctionnalités de l'application.</p>
            
            <div class="doc-image-container">
              <img src="/images/mainMenu-french.png" alt="Menu principal" />
              <span class="doc-image-caption">Figure 2 : Interface du menu principal</span>
            </div>
            
            <h3>Options disponibles</h3>
            <div class="doc-feature-grid">
              <div class="doc-feature-card">
                <div class="feature-icon">📝</div>
                <h4>${t.mainMenu.segment}</h4>
                <p>Accédez à l'espace de travail de segmentation IRM pour visualiser et segmenter les scans cérébraux.</p>
              </div>
              <div class="doc-feature-card">
                <div class="feature-icon">📖</div>
                <h4>${t.mainMenu.documentation}</h4>
                <p>Accédez à cette documentation d'aide pour des conseils sur l'utilisation de HeSeg.</p>
              </div>
            </div>
            
            <h3>Éléments de navigation</h3>
            <ul>
              <li><strong>Barre d'en-tête :</strong> Contient le sélecteur de langue et le bouton d'aide</li>
              <li><strong>Bouton ${t.mainMenu.logout} :</strong> Cliquez pour vous déconnecter en toute sécurité de votre compte</li>
              <li><strong>Cartes d'options :</strong> Cliquez sur n'importe quelle carte pour naviguer vers cette fonctionnalité</li>
            </ul>
            
            <div class="doc-tip">
              <div class="doc-tip-icon">💡</div>
              <div class="doc-tip-content">
                <strong>Astuce :</strong> Vous pouvez changer la langue à tout moment en utilisant le sélecteur de langue dans la barre d'en-tête.
              </div>
            </div>
          ` : `
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
                <h4>${t.mainMenu.segment}</h4>
                <p>Access the MRI segmentation workspace to view and segment brain scans.</p>
              </div>
              <div class="doc-feature-card">
                <div class="feature-icon">📖</div>
                <h4>${t.mainMenu.documentation}</h4>
                <p>Access this help documentation for guidance on using HeSeg.</p>
              </div>
            </div>
            
            <h3>Navigation Elements</h3>
            <ul>
              <li><strong>Header Bar:</strong> Contains language switcher and help button</li>
              <li><strong>${t.mainMenu.logout} Button:</strong> Click to securely log out of your account</li>
              <li><strong>Option Cards:</strong> Click any card to navigate to that feature</li>
            </ul>
            
            <div class="doc-tip">
              <div class="doc-tip-icon">💡</div>
              <div class="doc-tip-content">
                <strong>Tip:</strong> You can change the language at any time using the language switcher in the header bar.
              </div>
            </div>
          `
        },
        { 
          id: 'sub-3', 
          title: language === 'fr' ? 'Liste des cas' : 'Segment List Page', 
          content: language === 'fr' ? `
            <h2>Liste des cas de segmentation</h2>
            <p>Après avoir cliqué sur l'option <strong>${t.mainMenu.segment}</strong> dans le menu principal, vous serez dirigé vers cette page.</p>
            
            <div class="doc-image-container">
              <img src="/images/segmentList-french.png" alt="Liste des cas de segmentation" />
              <span class="doc-image-caption">Figure 3 : Interface de la liste des cas de segmentation</span>
            </div>
            
            <div class="doc-note">
              <div class="doc-note-icon">📝</div>
              <div class="doc-note-content">
                <strong>Note :</strong> Chaque annotateur se verra attribuer une liste d'images IRM à segmenter en fonction de son compte utilisateur.
              </div>
            </div>
            
            <h3>Description du tableau</h3>
            <table>
              <thead>
                <tr>
                  <th>Colonne</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>${t.segmentList.gender}</strong></td>
                  <td>Sexe du patient (Homme ou Femme)</td>
                </tr>
                <tr>
                  <td><strong>${t.segmentList.age}</strong></td>
                  <td>Âge du patient en années</td>
                </tr>
                <tr>
                  <td><strong>${t.segmentList.modality}</strong></td>
                  <td>Type d'image IRM utilisée pour la segmentation (pondérée T1 ou T2)</td>
                </tr>
                <tr>
                  <td><strong>${t.segmentList.lastModified}</strong></td>
                  <td>Enregistre la dernière fois que l'annotateur a modifié la segmentation de cette image IRM spécifique</td>
                </tr>
              </tbody>
            </table>
            
            <div class="doc-tip">
              <div class="doc-tip-icon">💡</div>
              <div class="doc-tip-content">
                <strong>Astuce :</strong> Cliquez sur n'importe quelle ligne du tableau pour ouvrir cette image IRM dans la visionneuse de segmentation.
              </div>
            </div>
            
            <div class="doc-note">
              <div class="doc-note-icon">📝</div>
              <div class="doc-note-content">
                <strong>Note :</strong> Les images IRM sont classées chronologiquement par date de dernière modification. L'image IRM la plus récemment modifiée apparaîtra en haut de la liste.
              </div>
            </div>
          ` : `
            <h2>Segment List Page</h2>
            <p>After clicking on the <strong>${t.mainMenu.segment}</strong> option in the Main Menu you will be directed to this page.</p>
            
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
                  <td><strong>${t.segmentList.gender}</strong></td>
                  <td>Gender of the patient (Male or Female)</td>
                </tr>
                <tr>
                  <td><strong>${t.segmentList.age}</strong></td>
                  <td>Age of the patient in years</td>
                </tr>
                <tr>
                  <td><strong>${t.segmentList.modality}</strong></td>
                  <td>Type of MRI image used for segmentation (T1 or T2 weighted)</td>
                </tr>
                <tr>
                  <td><strong>${t.segmentList.lastModified}</strong></td>
                  <td>Records the last time the annotator modified the segmentation of this specific MRI image</td>
                </tr>
              </tbody>
            </table>
            
            <div class="doc-tip">
              <div class="doc-tip-icon">💡</div>
              <div class="doc-tip-content">
                <strong>Tip:</strong> Click on any row in the table to open that MRI image in the segmentation viewer.
              </div>
            </div>
            
            <div class="doc-note">
              <div class="doc-note-icon">📝</div>
              <div class="doc-note-content">
                <strong>Note:</strong> The MRI images are ordered chronologically by the last modified date. The most recently modified MRI image will appear at the top of the list.
              </div>
            </div>
          `
        },
      ]
  
    },
    {
      id: 'section-2',
      title: language === 'fr' ? 'Visionneuse IRM' : 'MRI Viewer',
      subsections: [
        { 
          id: 'viewer-1', 
          title: language === 'fr' ? 'Aperçu général' : 'Main Overview', 
          content: language === 'fr' ? `
            <h2>Aperçu général</h2>
            <p>La visionneuse IRM est l'espace de travail principal pour visualiser et segmenter les scans cérébraux. Elle fournit un ensemble complet d'outils pour naviguer, analyser et annoter les images médicales.</p>
            
            <div class="doc-image-container">
              <img src="/images/mriViewer/mainView-french.png" alt="Interface principale de la visionneuse IRM" />
              <span class="doc-image-caption">Figure 4 : Interface principale de la visionneuse IRM</span>
            </div>
            
            <h3>Composants de l'interface</h3>
            <ul>
              <li><strong>Barre d'en-tête :</strong> Barre d'outils verte en haut contenant les boutons de mode de vue, les dimensions du volume, les paramètres et l'outil règle. <a href="#viewer-2" class="doc-link">→ Voir Barre d'en-tête</a></li>
              <li><strong>Zone de visualisation :</strong> Zone d'affichage principale montrant les coupes IRM avec les contrôles de zoom, panoramique et navigation. <a href="#viewer-5" class="doc-link">→ Voir Modes de vue</a></li>
              <li><strong>Barre latérale :</strong> Panneau gauche contenant la liste des structures, les coordonnées et les contrôles de segmentation. <a href="#viewer-3" class="doc-link">→ Voir Barre latérale</a></li>
            </ul>
            
            <div class="doc-note">
              <div class="doc-note-icon">📝</div>
              <div class="doc-note-content">
                <strong>Note :</strong> Chaque composant a sa propre page de documentation dédiée. Consultez la barre latérale pour plus de détails sur la barre d'en-tête, les modes de vue, la barre latérale et la vue 3D.
              </div>
            </div>
          ` : `
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
            
            <div class="doc-note">
              <div class="doc-note-icon">📝</div>
              <div class="doc-note-content">
                <strong>Note:</strong> Each component has its own dedicated documentation page. See the sidebar for more details on Header Bar, View Modes, Sidebar, and 3D View.
              </div>
            </div>
          `
        },
        { 
          id: 'viewer-2', 
          title: language === 'fr' ? 'Barre d\'en-tête' : 'Header Bar',
          nestedSections: [
            { id: 'header-settings', title: language === 'fr' ? 'Paramètres' : 'Settings' },
          ],
          content: language === 'fr' ? `
            <h2>Barre d'en-tête</h2>
            <p>La barre d'en-tête est la barre d'outils verte en haut de la visionneuse. Elle contient trois sections principales : <strong>Gauche</strong> (informations IRM), <strong>Milieu</strong> (paramètres de vue), et <strong>Droite</strong> (paramètres et outils supplémentaires).</p>
            
            <div class="doc-image-container">
              <img src="/images/mriViewer/headerBar-french.png" alt="Interface de la barre d'en-tête" />
              <span class="doc-image-caption">Figure 5 : Barre d'en-tête avec ses trois sections</span>
            </div>
            
            <h3>Section gauche — Informations IRM</h3>
            <p>Affiche les informations sur le scan IRM actuellement chargé :</p>
            <ul>
              <li><strong>${t.topBar.title} :</strong> Titre de la section d'outil</li>
              <li><strong>(232 × 256 × 80) :</strong> Dimensions de l'IRM en axes X, Y et Z (largeur, hauteur et profondeur en voxels)</li>
              <li><strong>(104, 97, 40) :</strong> Coordonnées voxel actuelles où le curseur pointe sur l'image IRM</li>
              <li><strong>0.90 × 0.90 × 2.00 mm :</strong> Espacement des voxels (distance entre les coupes dans les orientations Sagittale, Coronale et Axiale)</li>
            </ul>
            
            <div class="doc-tip">
              <div class="doc-tip-icon">💡</div>
              <div class="doc-tip-content">
                <strong>Astuce :</strong> Les coordonnées voxel se mettent à jour en temps réel lorsque vous déplacez votre curseur sur l'image IRM.
              </div>
            </div>
            
            <h3>Section centrale — Paramètres de vue</h3>
            <p>Contrôles pour changer l'affichage de l'IRM :</p>
            <ul>
              <li>
                <strong>${t.topBar.singleView}</strong><span class="doc-icon-btn"><img src="/images/icons/square.svg" alt="Vue simple" /></span> : Afficher une orientation à la fois 
                <a href="#single-view" class="doc-link">→ Voir Vue simple</a>
              </li>
              <li>
                <strong>${t.topBar.quadView}</strong><span class="doc-icon-btn"><img src="/images/icons/grid.svg" alt="Vue quadruple" /></span> : Afficher les trois orientations plus la vue 3D 
                <a href="#quad-view" class="doc-link">→ Voir Vue quadruple</a>
              </li>
              <li>
                <strong>${t.topBar.mosaicView}</strong><span class="doc-icon-btn"><img src="/images/icons/eye.svg" alt="Vue mosaïque" /></span> : Afficher plusieurs coupes dans une grille 
                <a href="#mosaic-view" class="doc-link">→ Voir Vue mosaïque</a>
              </li>
            </ul>
            
            <h3>Section droite — Outils & Paramètres</h3>
            <p>Outils supplémentaires et options de configuration :</p>
            <ul>
              <li>
                <strong>${t.topBar.ruler}</strong><span class="doc-icon-btn"><img src="/images/icons/ruler-3.svg" alt="Règle" class="rotate-90" /></span> : ${t.topBar.measureDistance}
                <a href="#viewer-6" class="doc-link">→ Voir Outil Règle</a>
              </li>
              <li>
                <strong>${t.topBar.settings}</strong><span class="doc-icon-btn"><img src="/images/icons/settings.svg" alt="Paramètres" /></span> : Ajuster ${t.settings.brightness}, ${t.settings.contrast} et ${t.settings.crossHair}
                <a href="#header-settings" class="doc-link">→ Voir Paramètres</a>
              </li>
            </ul>
            
            <div class="doc-note">
              <div class="doc-note-icon">📝</div>
              <div class="doc-note-content">
                <strong>Note :</strong> La barre d'en-tête est toujours visible quel que soit le mode de vue utilisé.
              </div>
            </div>
            <div class="doc-note">
              <div class="doc-note-icon">📝</div>
              <div class="doc-note-content">
                <strong>Note :</strong> Survoler n'importe quel bouton affichera une info-bulle avec son nom et sa fonction.
              </div>
            </div>
            
            <!-- Sous-section Paramètres -->
            <div id="header-settings" class="doc-subsection">
              <h2>${t.topBar.settings}</h2>
              <p>Le panneau des paramètres vous permet d'ajuster les propriétés d'affichage de la visionneuse IRM.</p>
              
              <div class="doc-image-container">
                <img src="/images/mriViewer/settings-french.png" alt="Panneau des paramètres" />
                <span class="doc-image-caption">Figure 6 : Panneau des paramètres ouvert</span>
              </div>
              
              <h3>Options des paramètres</h3>
              <ul>
                <li><strong>${t.settings.brightness} :</strong> Contrôle l'intensité de l'image IRM. Par défaut 50%, ce qui représente l'affichage normal.</li>
                <li><strong>${t.settings.contrast} :</strong> Ajuste la différence entre les zones claires et sombres de l'image IRM. Par défaut 50%.</li>
                <li><strong>${t.settings.crossHair} :</strong> Affiche deux lignes diagonales se croisant au point du curseur. Désactivé par défaut.</li>
              </ul>
              
              <div class="doc-image-container">
                <img src="/images/mriViewer/exampleSettings-french.png" alt="Exemple de paramètres" />
                <span class="doc-image-caption">Figure 7 : Exemple de paramètres</span>
              </div>
              
              <div class="doc-note">
                <div class="doc-note-icon">📝</div>
                <div class="doc-note-content">
                  <strong>Note :</strong> Les paramètres de ${t.settings.brightness} et ${t.settings.contrast} ne sont modifiables qu'en <strong>mode vue simple</strong>.
                </div>
              </div>
            </div>
          ` : `
            <h2>Header Bar</h2>
            <p>The Header Bar is the green toolbar at the top of the viewer. It contains three main sections: <strong>Left</strong> (MRI information), <strong>Middle</strong> (view settings), and <strong>Right</strong> (additional settings and tools).</p>
            
            <div class="doc-image-container">
              <img src="/images/mriViewer/headerBar-english.png" alt="Header Bar Interface" />
              <span class="doc-image-caption">Figure 5: Header Bar with its three sections</span>
            </div>
            
            <h3>Left Section — MRI Information</h3>
            <p>Displays information about the currently loaded MRI scan:</p>
            <ul>
              <li><strong>${t.topBar.title}:</strong> Title of the tool section</li>
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
                <strong>${t.topBar.singleView}</strong><span class="doc-icon-btn"><img src="/images/icons/square.svg" alt="Single View" /></span>: Display one orientation at a time 
                <a href="#single-view" class="doc-link">→ See Single View</a>
              </li>
              <li>
                <strong>${t.topBar.quadView}</strong><span class="doc-icon-btn"><img src="/images/icons/grid.svg" alt="Quad View" /></span>: Display all three orientations plus 3D view 
                <a href="#quad-view" class="doc-link">→ See Quad View</a>
              </li>
              <li>
                <strong>${t.topBar.mosaicView}</strong><span class="doc-icon-btn"><img src="/images/icons/eye.svg" alt="Mosaic View" /></span>: Display multiple slices in a grid 
                <a href="#mosaic-view" class="doc-link">→ See Mosaic View</a>
              </li>
            </ul>
            
            <h3>Right Section — Tools & Settings</h3>
            <p>Additional tools and configuration options:</p>
            <ul>
              <li>
                <strong>${t.topBar.ruler}</strong><span class="doc-icon-btn"><img src="/images/icons/ruler-3.svg" alt="Ruler" class="rotate-90" /></span>: ${t.topBar.measureDistance}
                <a href="#viewer-6" class="doc-link">→ See Ruler Tool</a>
              </li>
              <li>
                <strong>${t.topBar.settings}</strong><span class="doc-icon-btn"><img src="/images/icons/settings.svg" alt="Settings" /></span>: Adjust ${t.settings.brightness}, ${t.settings.contrast}, and ${t.settings.crossHair}
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
              <h2>${t.topBar.settings}</h2>
              <p>The Settings panel allows you to adjust the display properties of the MRI viewer.</p>
              
              <div class="doc-image-container">
                <img src="/images/mriViewer/settings-english.png" alt="Settings Panel" />
                <span class="doc-image-caption">Figure 6: Settings panel expanded</span>
              </div>
              
              <h3>Settings Options</h3>
              <ul>
                <li><strong>${t.settings.brightness}:</strong> Controls the intensity of the MRI image. Default is 50%, which represents the normal display.</li>
                <li><strong>${t.settings.contrast}:</strong> Adjusts the difference between light and dark areas in the MRI image. Default is 50%.</li>
                <li><strong>${t.settings.crossHair}:</strong> Displays two diagonal lines crossing at the cursor point. Disabled by default.</li>
              </ul>
              
              <div class="doc-image-container">
                <img src="/images/mriViewer/exampleSettings-english.png" alt="Example Settings" />
                <span class="doc-image-caption">Figure 7: Example Settings</span>
              </div>
              
              <div class="doc-note">
                <div class="doc-note-icon">📝</div>
                <div class="doc-note-content">
                  <strong>Note:</strong> ${t.settings.brightness} and ${t.settings.contrast} settings are editable only on <strong>single view mode</strong>.
                </div>
              </div>
            </div>
          `
        },
        {
          id: 'viewer-3', 
          title: language === 'fr' ? 'Barre latérale' : 'Side Bar', 
          nestedSections: [
            { id: 'sidebar-add-structure', title: language === 'fr' ? 'Ajouter une structure' : 'Add Structure' },
            { id: 'sidebar-structure-item', title: language === 'fr' ? 'Élément de structure' : 'Structure Item' },
          ],
          content: language === 'fr' ? `
            <h2>Barre latérale</h2>
            <p>La barre latérale est située sur le côté gauche de la visionneuse IRM. Elle permet d'accéder à la gestion des structures, aux outils de segmentation et aux paramètres supplémentaires.</p>
            
            <div class="doc-image-container">
              <img src="/images/mriViewer/sideBar-french.png" alt="Interface de la barre latérale" />
              <span class="doc-image-caption">Figure 8 : Interface de la barre latérale</span>
            </div>
            
            <h3>Section supérieure — Gestion des structures</h3>
            <p>Contient le titre "${t.sidebar.structures}" et les outils pour gérer les structures cérébrales à segmenter :</p>
            <ul>
              <li>
                <strong>Titre :</strong> Affiche "${t.sidebar.structures}" comme en-tête de section
              </li>
              <li>
                <strong>Bouton Ajouter</strong>
                <img src="/images/icons/plus.svg" alt="Ajouter" style="filter: brightness(0) invert(1); border: none;" />
                : Ouvre une fenêtre modale pour ajouter une nouvelle structure à segmenter
                <a href="#sidebar-add-structure" class="doc-link">→ Voir Ajouter une structure</a>
              </li>
            </ul>
            
            <h3>Section centrale — Liste des structures</h3>
            <p>Affiche toutes les structures qui ont été ajoutées pour la segmentation :</p>
            <ul>
              <li><strong>Éléments de structure :</strong> Chaque structure ajoutée apparaît comme un élément dépliable avec son indicateur de couleur, son nom et ses boutons d'action
                <a href="#sidebar-structure-item" class="doc-link">→ Voir Élément de structure</a>
              </li>
              <li><strong>Bouton de basculement :</strong> Le bouton demi-cercle vert sur le bord droit bascule la visibilité de la barre latérale (afficher/masquer)</li>
            </ul>
            
            <div class="doc-tip">
              <div class="doc-tip-icon">💡</div>
              <div class="doc-tip-content">
                <strong>Astuce :</strong> Cliquez sur le bouton demi-cercle vert pour réduire la barre latérale et gagner plus d'espace de visualisation pour les images IRM.
              </div>
            </div>
            
            <h3>Section inférieure — Accès rapide</h3>
            <p>Contient des boutons utilitaires pour des fonctionnalités supplémentaires :</p>
            <ul>
              <li>
                <strong>Sélecteur de langue :</strong> Basculer entre l'interface anglaise et française
              </li>
              <li>
                <strong>Bouton d'aide en vert</strong>
                : Ouvre cette page de documentation pour la visionneuse IRM
              </li>
            </ul>
            
            <!-- Sous-section Ajouter une structure -->
            <div id="sidebar-add-structure" class="doc-subsection">
              <h2>${t.sidebar.addNew}</h2>
              <p>La fenêtre modale Ajouter une structure vous permet de créer une nouvelle structure cérébrale pour la segmentation.</p>
              
              <div class="doc-image-container">
                <img src="/images/mriViewer/addStructure-french.png" alt="Fenêtre modale Ajouter une structure" />
                <span class="doc-image-caption">Figure 9 : Fenêtre modale Ajouter une structure</span>
              </div>
              
              <h3>Comment ajouter une structure</h3>
              <div class="doc-steps">
                <div class="doc-step">
                  <span class="step-number">1</span>
                  <div class="step-content">
                    <strong>Ouvrir la fenêtre modale</strong>
                    <p>Cliquez sur le bouton <span style="font-size: 1.2rem; font-weight: bold; color: white;">+</span></p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">2</span>
                  <div class="step-content">
                    <strong>Sélectionner une structure</strong>
                    <p>Choisissez une structure cérébrale dans la liste déroulante (ex: STN, GPi, RN).</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">3</span>
                  <div class="step-content">
                    <strong>Choisir une couleur</strong>
                    <p>Sélectionnez une couleur pour le masque de segmentation dans la palette de couleurs disponible.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">4</span>
                  <div class="step-content">
                    <strong>Confirmer</strong>
                    <p>Cliquez sur "${t.sidebar.addNew}" pour créer la structure. Elle apparaîtra dans la liste de la barre latérale.</p>
                  </div>
                </div>
              </div>
              
              <div class="doc-note">
                <div class="doc-note-icon">📝</div>
                <div class="doc-note-content">
                  <strong>Note :</strong> Chaque couleur ne peut être utilisée qu'une seule fois. Les couleurs déjà utilisées apparaîtront désactivées dans la palette.
                </div>
              </div>
            </div>
            
            <!-- Sous-section Élément de structure -->
            <div id="sidebar-structure-item" class="doc-subsection">
              <h2>Élément de structure</h2>
              <p>Chaque structure dans la barre latérale a son propre élément avec des contrôles pour gérer les coordonnées et la segmentation.</p>
              
              <div class="doc-image-container">
                <img src="/images/mriViewer/structureItem-french.png" alt="Élément de structure" />
                <span class="doc-image-caption">Figure 10 : Élément de structure déplié</span>
              </div>
              
              <h3>Composants de l'élément de structure</h3>
              <table>
                <thead>
                  <tr>
                    <th>Composant</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Indicateur de couleur</strong></td>
                    <td>Affiche la couleur assignée au masque de segmentation de cette structure</td>
                  </tr>
                  <tr>
                    <td><strong>Nom de la structure</strong></td>
                    <td>Affiche le nom de la structure cérébrale (ex: STN, GPi)</td>
                  </tr>
                  <tr>
                    <td><strong>Basculement de visibilité</strong></td>
                    <td>Afficher ou masquer la superposition du masque de segmentation sur l'IRM</td>
                  </tr>
                  <tr>
                    <td><strong>Bouton Éditer</strong></td>
                    <td>Entrer en mode édition du masque pour affiner manuellement la segmentation</td>
                  </tr>
                  <tr>
                    <td><strong>Déplier/Replier</strong></td>
                    <td>Cliquez pour afficher ou masquer la liste des coordonnées</td>
                  </tr>
                </tbody>
              </table>
              
              <h3>Gestion des coordonnées</h3>
              <p>Lorsqu'il est déplié, l'élément de structure affiche deux sections :</p>
              
              <h4>${t.sidebar.active}</h4>
              <ul>
                <li><strong>Bouton Ajouter un point</strong> <img src="/images/icons/plus.svg" alt="Ajouter" style="filter: brightness(0) invert(1); border: none;" /> : Entrer en mode placement pour ajouter un nouveau point de coordonnées</li>
                <li><strong>Liste des points :</strong> Affiche tous les points qui n'ont pas encore été segmentés</li>
                <li><strong>Bouton Générer</strong> <img src="/images/icons/star.svg" alt="Générer" style="filter: brightness(0) invert(1); border: none;" /> : Générer la segmentation IA pour un point spécifique</li>
                <li><strong>Génération par lot :</strong> Sélectionnez plusieurs points et générez la segmentation pour tous à la fois</li>
              </ul>
              
              <h4>${t.sidebar.segmented}</h4>
              <ul>
                <li><strong>Points complétés :</strong> Affiche tous les points qui ont été segmentés avec succès</li>
                <li><strong>Badge d'orientation :</strong> Affiche l'orientation (Ax/Co/Sa) où le point a été placé</li>
                <li><strong>Naviguer :</strong> Cliquez sur n'importe quel point pour accéder à cet emplacement exact dans l'IRM</li>
              </ul>
              
              <div class="doc-tip">
                <div class="doc-tip-icon">💡</div>
                <div class="doc-tip-content">
                  <strong>Astuce :</strong> Cliquer sur un point de coordonnées naviguera automatiquement vers la coupe et l'orientation correctes, avec un zoom de 400% pour une visualisation précise.
                </div>
              </div>
            </div>
          ` : `
            <h2>Side Bar</h2>
            <p>The Side Bar is located on the left side of the MRI viewer. It provides access to structure management, segmentation tools, and additional settings.</p>
            
            <div class="doc-image-container">
              <img src="/images/mriViewer/sideBar-english.png" alt="Side Bar Interface" />
              <span class="doc-image-caption">Figure 8: Side Bar interface</span>
            </div>
            
            <h3>Top Section — Structure Management</h3>
            <p>Contains the title "${t.sidebar.structures}" and tools for managing brain structures to be segmented:</p>
            <ul>
              <li>
                <strong>Title:</strong> Displays "${t.sidebar.structures}" as the section header
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
              <h2>${t.sidebar.addNew}</h2>
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
                    <p>Click "${t.sidebar.addNew}" to create the structure. It will appear in the sidebar list.</p>
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
              
              <h4>${t.sidebar.active}</h4>
              <ul>
                <li><strong>Add Point Button</strong> <img src="/images/icons/plus.svg" alt="Add" style="filter: brightness(0) invert(1); border: none;" />: Enter placement mode to add a new coordinate point</li>
                <li><strong>Point List:</strong> Shows all points that have not been segmented yet</li>
                <li><strong>Generate Button</strong> <img src="/images/icons/star.svg" alt="Generate" style="filter: brightness(0) invert(1); border: none;" />: Generate AI segmentation for a specific point</li>
                <li><strong>Batch Generate:</strong> Select multiple points and generate segmentation for all at once</li>
              </ul>
              
              <h4>${t.sidebar.segmented}</h4>
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
          title: language === 'fr' ? 'Segmentation' : 'Segmentation', 
          nestedSections: [
            { id: 'segmentation-toolbar', title: language === 'fr' ? 'Barre d\'outils de segmentation' : 'Segmentation Toolbar' },
            { id: 'segmentation-coordinates', title: language === 'fr' ? 'Segmentation par coordonnées' : 'Coordinate Segmentation' },
          ],
          content: language === 'fr' ? `
            <h2>Segmentation</h2>
            <p>La segmentation est le processus d'identification et de délimitation de structures cérébrales spécifiques dans les images IRM. HeSeg propose deux méthodes principales de segmentation : l'édition manuelle avec la barre d'outils et la segmentation assistée par IA basée sur les coordonnées.</p>
            
            <div class="doc-image-container">
              <img src="/images/mriViewer/structureItem-french.png" alt="Aperçu de la segmentation" />
              <span class="doc-image-caption">Figure 11 : Segmentation en action</span>
            </div>
            
            <h3>Méthodes de segmentation</h3>
            <ul>
              <li>
                <strong>Édition manuelle :</strong> Utilisez la barre d'outils de segmentation pour dessiner ou effacer des régions de masque directement sur les coupes IRM
                <a href="#segmentation-toolbar" class="doc-link">→ Voir Barre d'outils de segmentation</a>
              </li>
              <li>
                <strong>Assistée par IA :</strong> Placez des points de coordonnées et laissez le modèle SAM (Segment Anything Model) effectuer la segmentation automatiquement
                <a href="#segmentation-coordinates" class="doc-link">→ Voir Segmentation par coordonnées</a>
              </li>
            </ul>
            
            <div class="doc-tip">
              <div class="doc-tip-icon">💡</div>
              <div class="doc-tip-content">
                <strong>Astuce :</strong> Pour de meilleurs résultats, utilisez d'abord la segmentation assistée par IA, puis affinez le masque manuellement avec la barre d'outils.
              </div>
            </div>
            
            <!-- Sous-section Barre d'outils de segmentation -->
            <div id="segmentation-toolbar" class="doc-subsection">
              <h2>Barre d'outils de segmentation</h2>
              <p>La barre d'outils de segmentation apparaît lorsque vous entrez en mode édition pour une structure. Elle fournit des outils pour dessiner et affiner manuellement les masques de segmentation.</p>
              
              <div class="doc-image-container">
                <img src="/images/mriViewer/segmentationTool-french.png" alt="Barre d'outils de segmentation" />
                <span class="doc-image-caption">Figure 12 : Barre d'outils de segmentation</span>
              </div>
              
              <h3>Composants de la barre d'outils</h3>
              <table>
                <thead>
                  <tr>
                    <th>Outil</th>
                    <th>Icône</th>
                    <th>Description</th>
                    <th>Raccourci</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>${t.segmentationToolbar.draw}</strong></td>
                    <td><span style="font-size: 1.1rem;">✏️</span></td>
                    <td>Ajouter au masque de segmentation en dessinant sur l'image</td>
                    <td><kbd>D</kbd></td>
                  </tr>
                  <tr>
                    <td><strong>${t.segmentationToolbar.erase}</strong></td>
                    <td><span style="font-size: 1.1rem;">🧹</span></td>
                    <td>Supprimer des parties du masque de segmentation</td>
                    <td><kbd>E</kbd></td>
                  </tr>
                  <tr>
                    <td><strong>${t.segmentationToolbar.brushSize}</strong></td>
                    <td><span style="font-size: 1.1rem;">◯</span></td>
                    <td>Ajuster la taille du pinceau de dessin/effacement (1-20)</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><strong>${t.segmentationToolbar.undo}</strong></td>
                    <td><span style="font-size: 1.1rem;">↩️</span></td>
                    <td>Annuler la dernière action de dessin</td>
                    <td><kbd>Ctrl</kbd> + <kbd>Z</kbd></td>
                  </tr>
                  <tr>
                    <td><strong>${t.segmentationToolbar.redo}</strong></td>
                    <td><span style="font-size: 1.1rem;">↪️</span></td>
                    <td>Rétablir l'action précédemment annulée</td>
                    <td><kbd>Ctrl</kbd> + <kbd>Y</kbd></td>
                  </tr>
                  <tr>
                    <td><strong>${t.segmentationToolbar.previousSlice}</strong></td>
                    <td><span style="font-size: 1.1rem;">⬅️</span></td>
                    <td>Naviguer vers la coupe précédente</td>
                    <td><kbd>←</kbd></td>
                  </tr>
                  <tr>
                    <td><strong>${t.segmentationToolbar.nextSlice}</strong></td>
                    <td><span style="font-size: 1.1rem;">➡️</span></td>
                    <td>Naviguer vers la coupe suivante</td>
                    <td><kbd>→</kbd></td>
                  </tr>
                  <tr>
                    <td><strong>${t.segmentationToolbar.complete}</strong></td>
                    <td><span style="font-size: 1.1rem;">✓</span></td>
                    <td>Terminer l'édition et sauvegarder le masque</td>
                    <td><kbd>Entrée</kbd></td>
                  </tr>
                </tbody>
              </table>
              <div class="doc-note">
                <div class="doc-note-icon">📝</div>
                <div class="doc-note-content">
                  <strong>Note :</strong> <strong>L'historique d'annulation et de rétablissement</strong> est spécifique à chaque structure en cours d'édition et pour chaque coupe.
                </div>
              </div>
              
              <h3>Comment utiliser la barre d'outils</h3>
              <div class="doc-steps">
                <div class="doc-step">
                  <span class="step-number">1</span>
                  <div class="step-content">
                    <strong>Entrer en mode édition</strong>
                    <p>Cliquez sur le bouton d'édition (✏️) sur une structure dans la barre latérale pour ouvrir la barre d'outils.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">2</span>
                  <div class="step-content">
                    <strong>Sélectionner un outil</strong>
                    <p>Choisissez ${t.segmentationToolbar.draw} <kbd>D</kbd> pour ajouter au masque ou ${t.segmentationToolbar.erase} <kbd>E</kbd> pour supprimer.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">3</span>
                  <div class="step-content">
                    <strong>Ajuster la taille du pinceau</strong>
                    <p>Utilisez le curseur pour définir la taille du pinceau pour des traits précis ou larges.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">4</span>
                  <div class="step-content">
                    <strong>Dessiner sur l'image</strong>
                    <p>Cliquez et faites glisser sur l'image IRM pour dessiner ou effacer le masque.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">5</span>
                  <div class="step-content">
                    <strong>Naviguer entre les coupes</strong>
                    <p>Utilisez les boutons fléchés ou les touches fléchées du clavier pour vous déplacer entre les coupes pendant l'édition.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">6</span>
                  <div class="step-content">
                    <strong>Terminer l'édition</strong>
                    <p>Cliquez sur la coche (✓) ou appuyez sur <kbd>Entrée</kbd> pour sauvegarder et quitter le mode édition.</p>
                  </div>
                </div>
              </div>
              
              <h3>Tutoriel vidéo</h3>
              <div class="doc-video-container">
                <video controls width="100%">
                  <source src="/videos/mriViewer/segmentationTool-french.webm" type="video/webm" />
                  Votre navigateur ne supporte pas la balise vidéo.
                </video>
                <span class="doc-video-caption">Vidéo 1 : Utilisation de la barre d'outils de segmentation</span>
              </div>
              
              <div class="doc-note">
                <div class="doc-note-icon">📝</div>
                <div class="doc-note-content">
                  <strong>Note :</strong> Les modifications sont automatiquement sauvegardées lorsque vous naviguez entre les coupes. Utilisez ${t.segmentationToolbar.undo} <kbd>Ctrl</kbd> + <kbd>Z</kbd> si vous faites une erreur.
                </div>
              </div>
            </div>
            
            <!-- Sous-section Segmentation par coordonnées -->
            <div id="segmentation-coordinates" class="doc-subsection">
              <h2>Segmentation par coordonnées</h2>
              <p>La segmentation basée sur les coordonnées utilise l'IA (SAM - Segment Anything Model) pour générer automatiquement des masques basés sur les points que vous placez sur l'image IRM.</p>
              
              <h3>Comment ça fonctionne</h3>
              <div class="doc-feature-grid">
                <div class="doc-feature-card">
                  <div class="feature-icon">📍</div>
                  <h4>1. Placer un point</h4>
                  <p>Cliquez sur la structure que vous voulez segmenter pour placer un point de coordonnées.</p>
                </div>
                <div class="doc-feature-card">
                  <div class="feature-icon">🤖</div>
                  <h4>2. Traitement IA</h4>
                  <p>Le modèle SAM analyse l'image et génère un masque de segmentation.</p>
                </div>
                <div class="doc-feature-card">
                  <div class="feature-icon">✨</div>
                  <h4>3. Voir le résultat</h4>
                  <p>Le masque généré est affiché et peut être affiné manuellement.</p>
                </div>
              </div>
              
              <h3>Guide étape par étape</h3>
              <div class="doc-steps">
                <div class="doc-step">
                  <span class="step-number">1</span>
                  <div class="step-content">
                    <strong>Sélectionner une structure</strong>
                    <p>Choisissez ou créez une structure dans la barre latérale que vous voulez segmenter.</p>
                  </div>
                </div>
                
                <div class="doc-step">
                  <span class="step-number">2</span>
                  <div class="step-content">
                    <strong>Ajouter un point de coordonnées</strong>
                    <p>Cliquez sur le bouton <span style="font-size: 1.2rem; font-weight: bold;">+</span> à côté de "${t.sidebar.active}" dans l'élément de structure.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">3</span>
                  <div class="step-content">
                    <strong>Naviguer vers la cible</strong>
                    <p>Naviguez jusqu'à la coupe où vous voulez placer le point en utilisant le défilement ou les touches fléchées.</p>
                  </div>
                </div>
                <div class="doc-image-container">
                  <img src="/images/mriViewer/selectPoint-french.png" alt="Pointage de coordonnées" />
                  <span class="doc-image-caption">Figure 13 : Sélectionner un point</span>
                </div>
                <div class="doc-step">
                  <span class="step-number">4</span>
                  <div class="step-content">
                    <strong>Placer le point</strong>
                    <p>Cliquez sur le centre de la structure que vous voulez segmenter. Un réticule apparaîtra.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">5</span>
                  <div class="step-content">
                    <strong>Confirmer le point</strong>
                    <p>Cliquez sur "${t.common.save}" pour confirmer le placement du point. Le point apparaîtra dans la liste des Points actifs.</p>
                  </div>
                </div>
                <div class="doc-image-container">
                  <img src="/images/mriViewer/confirmPoint-french.png" alt="Confirmer le point" />
                  <span class="doc-image-caption">Figure 14 : Confirmer le point</span>
                </div>
                <div class="doc-step">
                  <span class="step-number">6</span>
                  <div class="step-content">
                    <strong>Générer la segmentation</strong>
                    <p>Cliquez sur le bouton étoile (⭐) à côté du point pour générer la segmentation IA.</p>
                  </div>
                </div>
                <div class="doc-image-container">
                  <img src="/images/mriViewer/generate-french.png" alt="Générer la segmentation" />
                  <span class="doc-image-caption">Figure 15 : Générer la segmentation</span>
                </div>
                <div class="doc-step">
                  <span class="step-number">7</span>
                  <div class="step-content">
                    <strong>Réviser et affiner</strong>
                    <p>Une fois généré, le masque apparaît sur l'IRM. Utilisez la barre d'outils pour affiner si nécessaire.</p>
                  </div>
                </div>
                <div class="doc-image-container">
                  <img src="/images/mriViewer/refine-french.png" alt="Affiner la segmentation" />
                  <span class="doc-image-caption">Figure 16 : Affiner et éditer la segmentation</span>
                </div>
              </div>
              
              <h3>Tutoriel vidéo</h3>
              <div class="doc-video-container">
                <video controls width="100%">
                  <source src="/videos/mriViewer/samSegmentation-french.mp4" type="video/mp4" />
                  Votre navigateur ne supporte pas la balise vidéo.
                </video>
                <span class="doc-video-caption">Vidéo 2 : Segmentation par coordonnées avec l'IA</span>
              </div>
              
              <div class="doc-tip">
                <div class="doc-tip-icon">💡</div>
                <div class="doc-tip-content">
                  <strong>Astuce :</strong> Placez les points au centre de la structure pour de meilleurs résultats de segmentation IA. Évitez de placer des points sur les bords ou les limites.
                </div>
              </div>
              <div class="doc-note">
                <div class="doc-note-icon">📝</div>
                <div class="doc-note-content">
                  <strong>Note :</strong> La segmentation peut également être effectuée en vues <strong>Sagittale</strong> et <strong>Coronale</strong>, pas seulement en Axiale.
                </div>
              </div>
            </div>
          ` : `
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
                    <td><strong>${t.segmentationToolbar.draw}</strong></td>
                    <td><span style="font-size: 1.1rem;">✏️</span></td>
                    <td>Add to the segmentation mask by drawing on the image</td>
                    <td><kbd>D</kbd></td>
                  </tr>
                  <tr>
                    <td><strong>${t.segmentationToolbar.erase}</strong></td>
                    <td><span style="font-size: 1.1rem;">🧹</span></td>
                    <td>Remove parts of the segmentation mask</td>
                    <td><kbd>E</kbd></td>
                  </tr>
                  <tr>
                    <td><strong>${t.segmentationToolbar.brushSize}</strong></td>
                    <td><span style="font-size: 1.1rem;">◯</span></td>
                    <td>Adjust the size of the drawing/erasing brush (1-20)</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td><strong>${t.segmentationToolbar.undo}</strong></td>
                    <td><span style="font-size: 1.1rem;">↩️</span></td>
                    <td>Undo the last drawing action</td>
                    <td><kbd>Ctrl</kbd> + <kbd>Z</kbd></td>
                  </tr>
                  <tr>
                    <td><strong>${t.segmentationToolbar.redo}</strong></td>
                    <td><span style="font-size: 1.1rem;">↪️</span></td>
                    <td>Redo the previously undone action</td>
                    <td><kbd>Ctrl</kbd> + <kbd>Y</kbd></td>
                  </tr>
                  <tr>
                    <td><strong>${t.segmentationToolbar.previousSlice}</strong></td>
                    <td><span style="font-size: 1.1rem;">⬅️</span></td>
                    <td>Navigate to the previous slice</td>
                    <td><kbd>←</kbd></td>
                  </tr>
                  <tr>
                    <td><strong>${t.segmentationToolbar.nextSlice}</strong></td>
                    <td><span style="font-size: 1.1rem;">➡️</span></td>
                    <td>Navigate to the next slice</td>
                    <td><kbd>→</kbd></td>
                  </tr>
                  <tr>
                    <td><strong>${t.segmentationToolbar.complete}</strong></td>
                    <td><span style="font-size: 1.1rem;">✓</span></td>
                    <td>Finish editing and save the mask</td>
                    <td><kbd>Enter</kbd></td>
                  </tr>
                </tbody>
              </table>
              <div class="doc-note">
                <div class="doc-note-icon">📝</div>
                <div class="doc-note-content">
                  <strong>Note:</strong> <strong>The redo and undo history</strong> is specific to each structure being edited and for each slice.
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
                    <p>Choose ${t.segmentationToolbar.draw} <kbd>D</kbd> to add to the mask or ${t.segmentationToolbar.erase} <kbd>E</kbd> to remove.</p>
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
                  <strong>Note:</strong> Changes are automatically saved when you navigate between slices. Use ${t.segmentationToolbar.undo} <kbd>Ctrl</kbd> + <kbd>Z</kbd> if you make a mistake.
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
                    <p>Click the <span style="font-size: 1.2rem; font-weight: bold;">+</span> button next to "${t.sidebar.active}" in the structure item.</p>
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
                    <p>Click "${t.common.save}" to confirm the point placement. The point will appear in the Active Points list.</p>
                  </div>
                </div>
                <div class="doc-image-container">
                  <img src="/images/mriViewer/confirmPoint-english.png" alt="Confirm Point" />
                  <span class="doc-image-caption">Figure 14: Confirm Point</span>
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
                  <span class="doc-image-caption">Figure 15: Generate Segmentation</span>
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
                  <span class="doc-image-caption">Figure 16: Refine and Edit The Segmentation</span>
                </div>
              </div>
              
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
          title: language === 'fr' ? 'Modes de vue' : 'Views', 
          nestedSections: [
            { id: 'single-view', title: language === 'fr' ? 'Vue simple' : 'Single View' },
            { id: 'quad-view', title: language === 'fr' ? 'Vue quadruple' : 'Quad View' },
            { id: 'mosaic-view', title: language === 'fr' ? 'Vue mosaïque' : 'Mosaic View' },
            { id: '3d-view', title: language === 'fr' ? 'Reconstruction 3D' : '3D Reconstruction' },
          ],
          content: language === 'fr' ? `
            <h2>Modes de vue</h2>
            <p>HeSeg propose plusieurs modes de vue pour visualiser les images IRM sous différentes perspectives. Chaque mode de vue est conçu pour des tâches et des flux de travail spécifiques.</p>
            
            <h3>Modes de vue disponibles</h3>
            <table>
              <thead>
                <tr>
                  <th>Mode de vue</th>
                  <th>Raccourci</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Vue simple</strong></td>
                  <td><kbd>1</kbd></td>
                  <td>Afficher une orientation à la fois (Axiale, Coronale ou Sagittale)</td>
                </tr>
                <tr>
                  <td><strong>Vue quadruple</strong></td>
                  <td><kbd>4</kbd></td>
                  <td>Afficher les trois orientations plus la vue 3D simultanément</td>
                </tr>
                <tr>
                  <td><strong>Vue mosaïque</strong></td>
                  <td><kbd>M</kbd></td>
                  <td>Afficher plusieurs coupes dans une grille pour un aperçu rapide</td>
                </tr>
                <tr>
                  <td><strong>Vue 3D</strong></td>
                  <td><kbd>3</kbd></td>
                  <td>Afficher la reconstruction 3D des structures segmentées</td>
                </tr>
              </tbody>
            </table>
            
            <div class="doc-tip">
              <div class="doc-tip-icon">💡</div>
              <div class="doc-tip-content">
                <strong>Astuce :</strong> Utilisez les raccourcis clavier pour basculer rapidement entre les modes de vue. Appuyez sur <kbd>1</kbd>, <kbd>4</kbd>, <kbd>M</kbd> ou <kbd>3</kbd> à tout moment.
              </div>
            </div>
            
            <!-- Sous-section Vue simple -->
            <div id="single-view" class="doc-subsection">
              <h2>Vue simple</h2>
              <p>La vue simple affiche une orientation à la fois, offrant une vue plus grande et plus détaillée des coupes IRM. C'est le mode de vue par défaut.</p>
              
              <div class="doc-image-container">
                <img src="/images/mriViewer/singleView-french.png" alt="Vue simple" />
                <span class="doc-image-caption">Figure 15 : Mode Vue simple montrant l'orientation Axiale</span>
              </div>
              
              <h3 style="display: inline-flex; align-items: center; gap: 0.5rem;">Orientations <span class="idc-circle">1</span></h3>
              <table>
                <thead>
                  <tr>
                    <th>Orientation</th>
                    <th>Description</th>
                    <th>Idéal pour</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Axiale</strong></td>
                    <td>Coupes horizontales (vue de haut en bas)</td>
                    <td>Visualiser la symétrie gauche-droite</td>
                  </tr>
                  <tr>
                    <td><strong>Coronale</strong></td>
                    <td>Coupes frontales (vue avant-arrière)</td>
                    <td>Visualiser la profondeur des structures</td>
                  </tr>
                  <tr>
                    <td><strong>Sagittale</strong></td>
                    <td>Coupes latérales (vue gauche-droite)</td>
                    <td>Visualiser les structures médianes</td>
                  </tr>
                </tbody>
              </table>
              
              <h3>Comment changer d'orientation</h3>
              <div class="doc-steps">
                <div class="doc-step">
                  <span class="step-number">1</span>
                  <div class="step-content">
                    <strong>Cliquer sur le sélecteur d'orientation</strong>
                    <p>Cliquez sur le bouton déroulant affichant l'orientation actuelle (ex: "Axiale") en bas de la visionneuse.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">2</span>
                  <div class="step-content">
                    <strong>Sélectionner l'orientation</strong>
                    <p>Choisissez Axiale, Coronale ou Sagittale dans le menu déroulant.</p>
                  </div>
                </div>
              </div>
              
              <h3>Contrôles de navigation</h3>
              <ul>
                <li><strong>Molette de défilement <span class="idc-circle">2</span> :</strong> Naviguer entre les coupes</li>
                <li><strong>Touches fléchées <span class="idc-circle">3</span> :</strong> <kbd>↑</kbd><kbd>↓</kbd> pour Axiale, <kbd>←</kbd><kbd>→</kbd> pour Coronale</li>
                <li><strong>Zoom <span class="idc-circle">4</span> :</strong> <kbd>Ctrl</kbd> + Défilement pour zoomer jusqu'à <strong>30</strong> fois avant/arrière</li>
                <li><strong>3D <span class="idc-circle">5</span> :</strong> Ouvrir un mini navigateur 3D indiquant la position 3D actuelle sur le cerveau</li>
                <div class="doc-image-container">
                  <img src="/images/mriViewer/mini3D-french.png" alt="Mini navigateur 3D" />
                  <span class="doc-image-caption">Figure 16 : Mini navigateur 3D ouvert</span>
                </div>
                <li><strong>Coordonnées actuelles</strong> <span class="idc-circle">6</span> : <strong>(x, y)</strong> pour Axiale, <strong>(x, z)</strong> pour Coronale, <strong>(y, z)</strong> pour Sagittale</li>
                <li><strong>Dimension de la coupe</strong> <span class="idc-circle">7</span> : <strong>(largeur, hauteur)</strong> pour Axiale, <strong>(largeur, profondeur)</strong> pour Coronale, <strong>(hauteur, profondeur)</strong> pour Sagittale</li>
              </ul>
              
              <div class="doc-note">
                <div class="doc-note-icon">📝</div>
                <div class="doc-note-content">
                  <strong>Note :</strong> La vue simple offre la plus grande zone de visualisation et est recommandée pour un travail de segmentation détaillé.
                </div>
              </div>
            </div>
            
            <!-- Sous-section Vue quadruple -->
            <div id="quad-view" class="doc-subsection">
              <h2>Vue quadruple</h2>
              <p>La vue quadruple affiche les trois orientations (Axiale, Coronale, Sagittale) plus une vue de reconstruction 3D simultanément dans une disposition à 4 panneaux.</p>
              
              <div class="doc-image-container">
                <img src="/images/mriViewer/quadView-french.png" alt="Vue quadruple" />
                <span class="doc-image-caption">Figure 16 : Vue quadruple montrant toutes les orientations et la 3D</span>
              </div>
              
              <h3>Disposition des panneaux</h3>
              <table>
                <thead>
                  <tr>
                    <th>Panneau</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Axiale</td>
                    <td>Coupes horizontales (vue de haut en bas)</td>
                  </tr>
                  <tr>
                    <td>Coronale</td>
                    <td>Coupes frontales (vue avant-arrière)</td>
                  </tr>
                  <tr>
                    <td>Sagittale</td>
                    <td>Coupes latérales (vue gauche-droite)</td>
                  </tr>
                  <tr>
                    <td>Reconstruction 3D</td>
                    <td>Reconstruction 3D des structures segmentées</td>
                  </tr>
                </tbody>
              </table>
              
              <h3>Fonctionnalités</h3>
              <ul>
                <li><strong>Navigation synchronisée :</strong> Cliquer sur un panneau met à jour la position du réticule dans tous les panneaux</li>
                <li><strong>Défilement indépendant :</strong> Chaque panneau peut défiler indépendamment</li>
                <li><strong>Réticule :</strong> Affiche la position actuelle dans les trois orientations</li>
                <li><strong>3D en temps réel :</strong> Le panneau 3D se met à jour lorsque vous segmentez des structures</li>
              </ul>
              
              <h3>Comment utiliser la vue quadruple</h3>
              <div class="doc-steps">
                <div class="doc-step">
                  <span class="step-number">1</span>
                  <div class="step-content">
                    <strong>Activer la vue quadruple</strong>
                    <p>Appuyez sur <kbd>4</kbd> ou cliquez sur le bouton Vue quadruple dans la barre d'en-tête.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">2</span>
                  <div class="step-content">
                    <strong>Naviguer</strong>
                    <p>Cliquez sur n'importe quel panneau pour définir la position du réticule. Tous les panneaux se synchroniseront sur cet emplacement.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">3</span>
                  <div class="step-content">
                    <strong>Défiler les coupes</strong>
                    <p>Survolez un panneau et utilisez la molette de défilement pour naviguer dans ses coupes.</p>
                  </div>
                </div>
              </div>
              
              <div class="doc-tip">
                <div class="doc-tip-icon">💡</div>
                <div class="doc-tip-content">
                  <strong>Astuce :</strong> La vue quadruple est idéale pour comprendre la position 3D des structures et pour vérifier la précision de la segmentation dans toutes les orientations.
                </div>
              </div>
            </div>
            
            <!-- Sous-section Vue mosaïque -->
            <div id="mosaic-view" class="doc-subsection">
              <h2>Vue mosaïque</h2>
              <p>La vue mosaïque affiche plusieurs coupes dans une disposition en grille, vous permettant de voir un aperçu de l'ensemble du volume en une seule fois.</p>
              
              <div class="doc-image-container">
                <img src="/images/mriViewer/mosaic-french.png" alt="Vue mosaïque" />
                <span class="doc-image-caption">Figure 17 : Vue mosaïque montrant plusieurs coupes</span>
              </div>
              
              <h3>Fonctionnalités</h3>
              <ul>
                <li><strong>Disposition en grille :</strong> Affiche les coupes dans une grille défilante</li>
                <li><strong>Aperçu rapide :</strong> Voir la structure complète du volume en un coup d'œil</li>
                <li><strong>Sélection de coupe :</strong> Cliquez sur n'importe quelle coupe pour y naviguer en vue simple</li>
                <li><strong>Sélection d'orientation :</strong> Choisissez quelle orientation afficher (Axiale, Coronale ou Sagittale)</li>
              </ul>
              
              <h3>Comment utiliser la vue mosaïque</h3>
              <div class="doc-steps">
                <div class="doc-step">
                  <span class="step-number">1</span>
                  <div class="step-content">
                    <strong>Activer la vue mosaïque</strong>
                    <p>Appuyez sur <kbd>M</kbd> ou cliquez sur le bouton Vue mosaïque dans la barre d'en-tête.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">2</span>
                  <div class="step-content">
                    <strong>Sélectionner l'orientation</strong>
                    <p>Utilisez le menu déroulant pour choisir l'orientation Axiale, Coronale ou Sagittale.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">3</span>
                  <div class="step-content">
                    <strong>Parcourir les coupes</strong>
                    <p>Faites défiler la grille pour voir toutes les coupes du volume.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">4</span>
                  <div class="step-content">
                    <strong>Sélectionner une coupe</strong>
                    <p>Cliquez sur n'importe quelle coupe pour basculer vers la vue simple à cette position.</p>
                  </div>
                </div>
              </div>
              
              <div class="doc-note">
                <div class="doc-note-icon">📝</div>
                <div class="doc-note-content">
                  <strong>Note :</strong> La vue mosaïque est utile pour trouver rapidement des coupes spécifiques ou pour revoir la structure globale et la segmentation du volume IRM.
                </div>
              </div>
            </div>
            
            <!-- Sous-section Vue 3D -->
            <div id="3d-view" class="doc-subsection">
              <h2>Reconstruction 3D</h2>
              <p>La vue 3D affiche une reconstruction tridimensionnelle des structures segmentées, vous permettant de visualiser les relations spatiales entre les différentes régions cérébrales.</p>
              
              <div class="doc-image-container">
                <img src="/images/mriViewer/rec3D-french.png" alt="Vue 3D" />
                <span class="doc-image-caption">Figure 18 : Reconstruction 3D des structures segmentées</span>
              </div>
              
              <h3>Contrôles 3D</h3>
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Contrôle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Rotation</strong></td>
                    <td>🖱️ Cliquer et glisser</td>
                  </tr>
                  <tr>
                    <td><strong>Zoom</strong></td>
                    <td>🖱️ Molette de défilement</td>
                  </tr>
                  <tr>
                    <td><strong>Panoramique</strong></td>
                    <td><kbd>Maj</kbd> + 🖱️ Glisser</td>
                  </tr>
                  <tr>
                    <td><strong>Réinitialiser la caméra</strong></td>
                    <td>Cliquer sur le bouton <span class="doc-btn-inline">↺</span></td>
                  </tr>
                </tbody>
              </table>
              
              <h3>Boutons de la barre d'outils</h3>
              <table>
                <thead>
                  <tr>
                    <th>Bouton</th>
                    <th>Nom</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span class="doc-btn-inline">↻</span></td>
                    <td><strong>Reconstruire</strong></td>
                    <td>Régénérer les maillages 3D à partir des données de segmentation actuelles</td>
                  </tr>
                  <tr>
                    <td><span class="doc-btn-inline">↺</span></td>
                    <td><strong>Réinitialiser la vue</strong></td>
                    <td>Réinitialiser la caméra à la position par défaut</td>
                  </tr>
                  <tr>
                    <td><span class="doc-btn-inline">+</span></td>
                    <td><strong>Zoom avant</strong></td>
                    <td>Zoomer dans la scène 3D</td>
                  </tr>
                  <tr>
                    <td><span class="doc-btn-inline">−</span></td>
                    <td><strong>Zoom arrière</strong></td>
                    <td>Dézoomer de la scène 3D</td>
                  </tr>
                  <tr>
                    <td><span class="doc-btn-inline">⚙</span></td>
                    <td><strong>Paramètres</strong></td>
                    <td>Ouvrir le panneau des options d'affichage</td>
                  </tr>
                  <tr>
                    <td><span class="doc-btn-inline">⛶</span></td>
                    <td><strong>Agrandir</strong></td>
                    <td>Basculer la vue 3D en plein écran</td>
                  </tr>
                </tbody>
              </table>
              
              <h3>Options d'affichage</h3>
              <div class="doc-image-container">
                <img src="/images/mriViewer/rec3DOptions-french.png" alt="Options de la vue 3D" />
                <span class="doc-image-caption">Figure 19 : Options de la reconstruction 3D</span>
              </div>
              <p>Cliquez sur le bouton <span class="doc-btn-inline">⚙</span> pour ouvrir le panneau des paramètres :</p>
              <table>
                <thead>
                  <tr>
                    <th>Option</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Mode de rendu</strong></td>
                    <td>
                      <span class="doc-btn-inline active">Surface</span>
                      <span class="doc-btn-inline">Cubes</span>
                      <span class="doc-btn-inline">Points</span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Afficher les axes</strong></td>
                    <td>Afficher les axes X, Y, Z pour l'orientation</td>
                  </tr>
                  <tr>
                    <td><strong>Afficher la grille</strong></td>
                    <td>Afficher la grille de référence au sol</td>
                  </tr>
                  <tr>
                    <td><strong>Boîte englobante</strong></td>
                    <td>Afficher les limites du volume</td>
                  </tr>
                  <tr>
                    <td><strong>Contour du cerveau</strong></td>
                    <td>Afficher la surface semi-transparente du cerveau</td>
                  </tr>
                  <tr>
                    <td><strong>Fil de fer</strong></td>
                    <td>Afficher les structures en maillage fil de fer</td>
                  </tr>
                  <tr>
                    <td><strong>Opacité de la structure</strong></td>
                    <td><span class="doc-slider">━━━━●━━</span> Ajuster la transparence (0% - 100%)</td>
                  </tr>
                </tbody>
              </table>
              
              <h3>Préréglages de caméra</h3>
              <p>Basculez rapidement vers des angles de vue standard :</p>
              <ul>
                <li><span class="doc-btn-inline">Libre</span> Rotation libre de la vue 3D</li>
                <li><span class="doc-btn-inline">Ax</span> <strong>Axiale :</strong> Vue du dessus (regardant vers le bas)</li>
                <li><span class="doc-btn-inline">Co</span> <strong>Coronale :</strong> Vue de face</li>
                <li><span class="doc-btn-inline">Sa</span> <strong>Sagittale :</strong> Vue de côté</li>
              </ul>
              
              <h3>Comment utiliser la vue 3D</h3>
              <div class="doc-steps">
                <div class="doc-step">
                  <span class="step-number">1</span>
                  <div class="step-content">
                    <strong>Activer la vue 3D</strong>
                    <p>Appuyez sur <kbd>3</kbd> ou cliquez sur le bouton <span class="doc-btn-inline">3D</span> dans l'en-tête. Alternativement, cliquez sur le bouton flottant <span class="doc-btn-green">3D</span> en bas à droite.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">2</span>
                  <div class="step-content">
                    <strong>Faire pivoter la vue</strong>
                    <p>Cliquez et faites glisser pour faire pivoter la scène 3D et voir les structures sous différents angles.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">3</span>
                  <div class="step-content">
                    <strong>Ajuster l'affichage</strong>
                    <p>Cliquez sur le bouton <span class="doc-btn-inline">⚙</span> pour ouvrir les options d'affichage et personnaliser le rendu.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">4</span>
                  <div class="step-content">
                    <strong>Utiliser les préréglages de caméra</strong>
                    <p>Cliquez sur <span class="doc-btn-inline">Ax</span>, <span class="doc-btn-inline">Co</span> ou <span class="doc-btn-inline">Sa</span> pour basculer rapidement vers des angles de vue standard.</p>
                  </div>
                </div>
                <div class="doc-step">
                  <span class="step-number">5</span>
                  <div class="step-content">
                    <strong>Reconstruire si nécessaire</strong>
                    <p>Cliquez sur <span class="doc-btn-inline">↻</span> pour régénérer les maillages si la vue 3D ne se met pas à jour automatiquement.</p>
                  </div>
                </div>
              </div>
              
              <h3>Tutoriel vidéo</h3>
              <div class="doc-video-container">
                <video controls width="100%">
                  <source src="/videos/mriViewer/rec3D-french.webm" type="video/webm" />
                  Votre navigateur ne supporte pas la balise vidéo.
                </video>
                <span class="doc-video-caption">Vidéo 3 : Utilisation de la vue de reconstruction 3D</span>
              </div>
              
              <div class="doc-tip">
                <div class="doc-tip-icon">💡</div>
                <div class="doc-tip-content">
                  <strong>Astuce :</strong> Activez <span class="doc-checkbox">☑</span> "Contour du cerveau" pour voir les structures segmentées dans le contexte du volume cérébral complet.
                </div>
              </div>
              
              <div class="doc-note">
                <div class="doc-note-icon">📝</div>
                <div class="doc-note-content">
                  <strong>Note :</strong> La vue 3D se met à jour automatiquement lorsque vous modifiez les masques de segmentation. Cliquez sur <span class="doc-btn-inline">↻</span> Reconstruire si la vue ne se met pas à jour.
                </div>
              </div>
            </div>
          ` : `
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
                    <td>Display X, Y, Z axes for orientation</td>
                  </tr>
                  <tr>
                    <td><strong>Show Grid</strong></td>
                    <td>Display reference grid on the floor</td>
                  </tr>
                  <tr>
                    <td><strong>Bounding Box</strong></td>
                    <td>Show the volume boundaries</td>
                  </tr>
                  <tr>
                    <td><strong>Brain Outline</strong></td>
                    <td>Show semi-transparent brain surface</td>
                  </tr>
                  <tr>
                    <td><strong>Wireframe</strong></td>
                    <td>Display structures as wireframe mesh</td>
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
          title: language === 'fr' ? 'Outil Règle' : 'Ruler Tool', 
          content: language === 'fr' ? `
            <h2>Outil Règle</h2>
            <p>L'outil Règle vous permet de mesurer les distances entre deux points sur l'image IRM. Ceci est utile pour mesurer la taille des structures cérébrales ou la distance entre les repères anatomiques.</p>
            
            <div class="doc-image-container">
              <img src="/images/mriViewer/ruler-french.png" alt="Outil Règle" />
              <span class="doc-image-caption">Figure 20 : Outil Règle mesurant la distance sur l'IRM</span>
            </div>
            
            <h3>Fonctionnalités</h3>
            <ul>
              <li><strong>Mesure de distance :</strong> Mesurer les distances en millimètres (mm) basées sur l'espacement des voxels</li>
              <li><strong>Règles multiples :</strong> Créer plusieurs lignes de mesure sur la même coupe</li>
              <li><strong>Points d'extrémité modifiables :</strong> Glisser les extrémités de la règle pour ajuster les mesures</li>
              <li><strong>Mises à jour en temps réel :</strong> La distance se met à jour lorsque vous déplacez le curseur</li>
            </ul>
            
            <h3>Comment utiliser la règle</h3>
            <div class="doc-steps">
              <div class="doc-step">
                <span class="step-number">1</span>
                <div class="step-content">
                  <strong>Activer l'outil Règle</strong>
                  <p>Cliquez sur le bouton <span class="doc-icon-btn"><img src="/images/icons/ruler-3.svg" alt="Règle" class="rotate-90" /></span> dans la barre d'en-tête. Le bouton sera mis en surbrillance lorsqu'il est actif.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">2</span>
                <div class="step-content">
                  <strong>Placer le premier point</strong>
                  <p>Cliquez sur l'image IRM pour placer le point de départ de votre mesure.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">3</span>
                <div class="step-content">
                  <strong>Placer le second point</strong>
                  <p>Déplacez votre curseur et cliquez à nouveau pour placer le point de fin. La ligne de la règle et la distance apparaîtront.</p>
                </div>
              </div>
              <div class="doc-step">
                <span class="step-number">4</span>
                <div class="step-content">
                  <strong>Lire la mesure</strong>
                  <p>La distance en millimètres (mm) est affichée au centre de la ligne de la règle.</p>
                </div>
              </div>
            </div>
            
            <h3>Modifier les règles</h3>
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Comment faire</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Déplacer une extrémité</strong></td>
                  <td>Cliquez et faites glisser l'une des extrémités (cercle) pour ajuster la mesure</td>
                </tr>
                <tr>
                  <td><strong>Ajouter une autre règle</strong></td>
                  <td>Cliquez simplement sur un nouvel emplacement pour commencer une autre mesure</td>
                </tr>
                <tr>
                  <td><strong>Supprimer la règle</strong></td>
                  <td>Double-cliquez sur le bouton <span class="doc-btn-inline">✕</span> au milieu de la ligne de la règle</td>
                </tr>
              </tbody>
            </table>
            
            <h3>Tutoriel vidéo</h3>
            <div class="doc-video-container">
              <video controls width="100%">
                <source src="/videos/mriViewer/ruler-french.webm" type="video/webm" />
                Votre navigateur ne supporte pas la balise vidéo.
              </video>
              <span class="doc-video-caption">Vidéo 4 : Utilisation de l'outil Règle</span>
            </div>
            
            <div class="doc-note">
              <div class="doc-note-icon">📝</div>
              <div class="doc-note-content">
                <strong>Note :</strong> Les lignes de règle ne sont visibles que lorsque l'outil Règle est activé. Désactivez le bouton règle pour masquer toutes les mesures.
              </div>
            </div>
            
            <div class="doc-warning">
              <div class="doc-warning-icon">⚠️</div>
              <div class="doc-warning-content">
                <strong>Attention :</strong> Les mesures de la règle ne sont <strong>pas sauvegardées</strong> après avoir rafraîchi la page ou fermé le navigateur. Faites des captures d'écran si vous devez conserver les mesures.
              </div>
            </div>
            
            <div class="doc-tip">
              <div class="doc-tip-icon">💡</div>
              <div class="doc-tip-content">
                <strong>Astuce :</strong> Les mesures sont calculées en utilisant l'espacement des voxels du fichier IRM, garantissant des distances réelles précises en millimètres.
              </div>
            </div>
          ` : `
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
        },
      ]
    },
    
  ]

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
