import { useState, useEffect, useCallback } from 'react';

export interface MapSettings {
    id: string | null;
    company_id: string;
    map_type: 'google' | 'mappr';
    real_time_tracking: boolean;
    web_key: string;
    android_key: string;
    ios_key: string;
    server_key: string;
    form_key: string;
    mappr_dashboard_url: string;
}

const defaultMapSettings: MapSettings = {
    id: null,
    company_id: '',
    map_type: 'google',
    real_time_tracking: false,
    web_key: '',
    android_key: '',
    ios_key: '',
    server_key: '',
    form_key: '',
    mappr_dashboard_url: 'https://mappr.io/dashboard',
};

export function useMapSettings() {
    const [mapSettings, setMapSettings] = useState<MapSettings>(defaultMapSettings);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMapSettings = useCallback(async () => {
        try {
            const apiKey = localStorage.getItem('api_key');
            if (!apiKey) {
                setError('No API key found');
                setLoading(false);
                return;
            }

            const response = await fetch('/api/v1/settings/map', {
                headers: { Authorization: `Bearer ${apiKey}` },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch map settings');
            }

            const result = await response.json();
            setMapSettings(result.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching map settings:', err);
            setError('Failed to load map settings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMapSettings();
    }, [fetchMapSettings]);

    const isMapConfigured = useCallback((): boolean => {
        return !!(mapSettings.web_key && mapSettings.web_key.length > 0);
    }, [mapSettings.web_key]);

    return {
        mapSettings,
        loading,
        error,
        refetch: fetchMapSettings,
        isMapConfigured,
    };
}
