import { useState, useEffect, useRef, useCallback } from 'react';
import { api, API_URL, clearAuth, loadStoredUser, saveAuth } from './api';
import AuthPage from './components/AuthPage';
import WelcomePage from './components/WelcomePage';
import LibraryPage from './components/LibraryPage';
import AdminLibraryPage from './components/AdminLibraryPage';
import StoryChat from './components/StoryChat';
import StoryPlayer from './components/StoryPlayer';
import { storyMatchesAgeBand } from './constants/ageBands';
import { LANGUAGE_CODES, isSupportedLocale } from './constants/languages';
import { getStoryImageUrl } from './utils/mediaUrl';
import { stopSpeaking } from './utils/speech';
import { I18nProvider } from './i18n/I18nProvider';
import { translate } from './i18n/messages';

function detectGuestLocale() {
  if (typeof navigator === 'undefined') return 'fr';
  const raw = (navigator.language || 'fr').slice(0, 2).toLowerCase();
  return isSupportedLocale(raw) ? raw : 'fr';
}

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [currentStory, setCurrentStory] = useState(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [currentLang, setCurrentLang] = useState('fr');
  const [uiLocale, setUiLocale] = useState(() => {
    const stored = loadStoredUser()?.preferences?.spokenLang;
    return isSupportedLocale(stored) ? stored : detectGuestLocale();
  });
  const [stories, setStories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [storyToResume, setStoryToResume] = useState(null);
  const [savedSceneIndex, setSavedSceneIndex] = useState(0);
  const [user, setUser] = useState(() => loadStoredUser());
  const [authChecking, setAuthChecking] = useState(!!localStorage.getItem('auth_token'));
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [recentStoryIds, setRecentStoryIds] = useState([]);
  const [progressByStoryId, setProgressByStoryId] = useState({});

  const fileInputRef = useRef(null);
  const storiesContainerRef = useRef(null);

  const applySpokenLocale = useCallback((spoken) => {
    if (isSupportedLocale(spoken)) {
      setUiLocale(spoken);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    const spoken = user?.preferences?.spokenLang;
    if (isSupportedLocale(spoken)) {
      setUiLocale(spoken);
    } else if (!user) {
      setUiLocale(detectGuestLocale());
    }
  }, [user?.preferences?.spokenLang, user]);

  useEffect(() => {
    if (user && currentView === 'library') {
      fetchStories();
      fetchLibraryData();
    }
  }, [user, currentView]);

  const restoreSession = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setAuthChecking(false);
      return;
    }
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data.user);
      saveAuth(token, data.user);
      applySpokenLocale(data.user?.preferences?.spokenLang);
      setCurrentView('library');
      fetchStories();
      fetchLibraryData();
    } catch {
      clearAuth();
      setUser(null);
      setCurrentView('welcome');
    } finally {
      setAuthChecking(false);
    }
  };

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    applySpokenLocale(loggedInUser.preferences?.spokenLang);
    const learn = loggedInUser.preferences?.learningLang;
    if (learn && LANGUAGE_CODES.includes(learn)) {
      setCurrentLang(learn);
    }
    setCurrentView('library');
    fetchStories();
    fetchLibraryData();
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setFavoriteIds([]);
    setRecentStoryIds([]);
    setProgressByStoryId({});
    setUiLocale(detectGuestLocale());
    setCurrentView('welcome');
  };

  const handleUserUpdate = (updatedUser) => {
    if (!updatedUser) return;

    setUser((prev) => {
      const merged = {
        ...(prev || {}),
        ...updatedUser,
        role: updatedUser.role || prev?.role || 'user',
        preferences: {
          ...(prev?.preferences || {}),
          ...(updatedUser.preferences || {}),
        },
      };
      return merged;
    });

    const token = localStorage.getItem('auth_token');
    if (token) {
      const prev = loadStoredUser();
      const merged = {
        ...(prev || {}),
        ...updatedUser,
        role: updatedUser.role || prev?.role || 'user',
        preferences: {
          ...(prev?.preferences || {}),
          ...(updatedUser.preferences || {}),
        },
      };
      saveAuth(token, merged);
    }

    applySpokenLocale(updatedUser.preferences?.spokenLang);

    const learn = updatedUser.preferences?.learningLang;
    if (learn && LANGUAGE_CODES.includes(learn)) {
      setCurrentLang(learn);
    }
  };

  useEffect(() => {
    if (currentView === 'player' && currentStory) {
      localStorage.setItem(`progress_${currentStory.id}`, currentSceneIndex.toString());
      setProgressByStoryId((prev) => ({
        ...prev,
        [currentStory.id]: currentSceneIndex,
      }));
      if (user) {
        api.put(`/api/library/progress/${currentStory.id}`, { sceneIndex: currentSceneIndex })
          .catch((error) => console.error('Erreur sauvegarde progression en ligne:', error));
      }
    }
  }, [currentView, currentStory, currentSceneIndex, user]);

  useEffect(() => {
    if (
      user &&
      currentView === 'player' &&
      currentStory &&
      currentSceneIndex === currentStory.scenes.length - 1
    ) {
      api.post('/api/library/history', {
        storyId: currentStory.id,
        eventType: 'completed',
      }).catch((error) => console.error('Erreur historique fin de lecture:', error));
    }
  }, [user, currentView, currentStory, currentSceneIndex]);

  const fetchStories = async () => {
    try {
      const response = await api.get('/api/stories');
      if (response.data && response.data.length > 0) {
        setStories(response.data);
        return response.data;
      }
      setStories([]);
      return [];
    } catch (error) {
      console.error('Erreur lors du chargement des histoires:', error);
      return [];
    }
  };

  const fetchLibraryData = async () => {
    if (!localStorage.getItem('auth_token')) return;
    try {
      const [favoritesResponse, recentResponse, progressResponse] = await Promise.all([
        api.get('/api/library/favorites').catch(() => ({ data: { favorites: [] } })),
        api.get('/api/library/history/recent').catch(() => ({ data: { recent: [] } })),
        api.get('/api/library/progress').catch(() => ({ data: { progress: [] } })),
      ]);
      setFavoriteIds((favoritesResponse.data.favorites || []).map((f) => f.storyId));
      setRecentStoryIds((recentResponse.data.recent || []).map((h) => h.storyId));
      const progressMap = {};
      for (const row of progressResponse.data.progress || []) {
        progressMap[row.storyId] = Number(row.sceneIndex) || 0;
      }
      setProgressByStoryId(progressMap);
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchStories();
      alert('Histoire importée avec succès !');
    } catch (error) {
      console.error("Erreur d'importation:", error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert("Erreur lors de l'import de l'histoire.");
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleStartStory = async (story) => {
    if (!story?.id || !Array.isArray(story.scenes) || story.scenes.length === 0) {
      alert("Cette entrée n'est pas une histoire valide.");
      return;
    }

    let parsedSceneIndex = 0;

    try {
      if (user) {
        const response = await api.get(`/api/library/progress/${story.id}`);
        parsedSceneIndex = response.data.progress?.sceneIndex ?? 0;
      } else {
        const savedProgression = localStorage.getItem(`progress_${story.id}`);
        parsedSceneIndex = parseInt(savedProgression, 10) || 0;
      }
    } catch (error) {
      console.error('Erreur récupération progression:', error);
      const savedProgression = localStorage.getItem(`progress_${story.id}`);
      parsedSceneIndex = parseInt(savedProgression, 10) || 0;
    }

    if (parsedSceneIndex > 0) {
      setStoryToResume(story);
      setSavedSceneIndex(Math.min(parsedSceneIndex, story.scenes.length - 1));
      setShowResumeModal(true);
    } else {
      startStoryAtScene(story, 0);
    }
  };

  const startStoryAtScene = (story, sceneIndex) => {
    if (!story?.id || !Array.isArray(story.scenes) || story.scenes.length === 0) {
      alert("Cette entrée n'est pas une histoire valide.");
      return;
    }

    setCurrentStory(story);
    setCurrentSceneIndex(sceneIndex);
    setCurrentView('player');
    setShowResumeModal(false);
    if (user) {
      api.post('/api/library/history', {
        storyId: story.id,
        eventType: 'started',
      }).catch((error) => console.error('Erreur historique de lecture:', error));
    }
  };

  const handleResumeStory = () => {
    startStoryAtScene(storyToResume, savedSceneIndex);
  };

  const handleRestartStory = () => {
    localStorage.removeItem(`progress_${storyToResume.id}`);
    if (user) {
      api.put(`/api/library/progress/${storyToResume.id}`, { sceneIndex: 0 })
        .catch((error) => console.error('Erreur remise à zéro progression:', error));
    }
    startStoryAtScene(storyToResume, 0);
  };

  const toggleFavorite = async (storyId) => {
    const isFavorite = favoriteIds.includes(storyId);
    setFavoriteIds((ids) =>
      isFavorite ? ids.filter((id) => id !== storyId) : [...ids, storyId]
    );

    try {
      if (isFavorite) {
        await api.delete(`/api/library/favorites/${storyId}`);
      } else {
        await api.post('/api/library/favorites', { storyId });
      }
      fetchLibraryData();
      return true;
    } catch (error) {
      console.error('Erreur modification favori:', error);
      setFavoriteIds((ids) =>
        isFavorite ? [...ids, storyId] : ids.filter((id) => id !== storyId)
      );
      alert("Impossible de modifier ce favori pour l'instant.");
      return false;
    }
  };

  const playRandomStory = () => {
    const isAdmin = user?.role === 'admin';
    const bandId = user?.preferences?.ageBand;
    const pool = isAdmin
      ? stories
      : bandId
        ? stories.filter((story) => storyMatchesAgeBand(story, bandId))
        : [];
    const candidates = pool.length > 0 ? pool : isAdmin ? stories : [];

    if (candidates.length === 0) {
      alert(translate(uiLocale, 'emptyStories'));
      return;
    }
    const randomIndex = Math.floor(Math.random() * candidates.length);
    handleStartStory(candidates[randomIndex]);
  };

  const handleBackToLibrary = () => {
    stopSpeaking();
    setCurrentView('library');
    setCurrentStory(null);
  };

  const handleStartStoryChat = () => {
    if (!user) {
      alert(translate(uiLocale, 'chatNeedLogin'));
      return;
    }
    stopSpeaking();
    setCurrentView('storyChat');
  };

  const scrollStoriesRight = () => {
    if (storiesContainerRef.current) {
      storiesContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const learningLang = user?.preferences?.learningLang || currentLang;
  const userLevel = user?.preferences?.level || 'debutant';
  const getImageUrl = (path, storyId) => getStoryImageUrl(path, storyId, API_URL);

  const showWelcome = !user && currentView !== 'login' && currentView !== 'register';

  return (
    <I18nProvider locale={uiLocale} setLocale={setUiLocale}>
      <div
        className="min-h-screen bg-[#FAF8F6] text-gray-900 font-sans selection:bg-[#8C5EB9] selection:text-white"
        translate="no"
      >
        <div
          className={
            showWelcome
              ? 'min-h-screen flex flex-col relative'
              : 'container mx-auto p-4 min-h-screen flex flex-col relative'
          }
        >
          {(currentView === 'login' || currentView === 'register') && (
            <AuthPage
              mode={currentView}
              onSuccess={handleAuthSuccess}
              onSwitchMode={(m) => setCurrentView(m)}
              onBack={() => setCurrentView('welcome')}
            />
          )}

          {showWelcome && (
            <WelcomePage
              loading={authChecking}
              onLogin={() => setCurrentView('login')}
              onRegister={() => setCurrentView('register')}
            />
          )}

          {user && currentView === 'library' && (
            (user.role || '').toLowerCase() === 'admin' ? (
              <AdminLibraryPage
                user={user}
                stories={stories}
                isUploading={isUploading}
                fileInputRef={fileInputRef}
                storiesContainerRef={storiesContainerRef}
                showResumeModal={showResumeModal}
                storyToResume={storyToResume}
                savedSceneIndex={savedSceneIndex}
                onLogout={handleLogout}
                onFileSelect={handleFileSelect}
                onStartStory={handleStartStory}
                onPlayRandom={playRandomStory}
                favoriteIds={favoriteIds}
                recentStoryIds={recentStoryIds}
                onToggleFavorite={toggleFavorite}
                onUserUpdate={handleUserUpdate}
                onRestartStory={handleRestartStory}
                onResumeStory={handleResumeStory}
                onCloseResumeModal={() => setShowResumeModal(false)}
                getImageUrl={getImageUrl}
                progressByStoryId={progressByStoryId}
              />
            ) : (
              <LibraryPage
                user={user}
                stories={stories}
                isUploading={isUploading}
                fileInputRef={fileInputRef}
                storiesContainerRef={storiesContainerRef}
                showResumeModal={showResumeModal}
                storyToResume={storyToResume}
                savedSceneIndex={savedSceneIndex}
                onLogout={handleLogout}
                onFileSelect={handleFileSelect}
                onScrollRight={scrollStoriesRight}
                onStartStory={handleStartStory}
                onPlayRandom={playRandomStory}
                favoriteIds={favoriteIds}
                recentStoryIds={recentStoryIds}
                onToggleFavorite={toggleFavorite}
                onUserUpdate={handleUserUpdate}
                onRestartStory={handleRestartStory}
                onResumeStory={handleResumeStory}
                onCloseResumeModal={() => setShowResumeModal(false)}
                getImageUrl={getImageUrl}
                progressByStoryId={progressByStoryId}
              />
            )
          )}

          {currentView === 'storyChat' && currentStory && user && (
            <StoryChat
              story={currentStory}
              targetLang={learningLang}
              level={userLevel}
              onBack={handleBackToLibrary}
            />
          )}

          {currentView === 'player' && currentStory && (
            <StoryPlayer
              story={currentStory}
              sceneIndex={currentSceneIndex}
              setSceneIndex={setCurrentSceneIndex}
              currentLang={currentLang}
              setCurrentLang={setCurrentLang}
              getImageUrl={getImageUrl}
              onClose={handleBackToLibrary}
              onStartChat={handleStartStoryChat}
            />
          )}
        </div>
      </div>
    </I18nProvider>
  );
}

export default App;
