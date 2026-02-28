import { writable } from 'svelte/store';
import type { ComponentType } from 'svelte';

export interface RightPanelState {
  isOpen: boolean;
  title: string;
  content?: string;
  component?: ComponentType;
  props?: Record<string, any>;
}

const initialState: RightPanelState = {
  isOpen: false,
  title: 'Details',
  content: undefined,
  component: undefined,
  props: undefined
};

function createRightPanelStore() {
  const { subscribe, set, update } = writable<RightPanelState>(initialState);

  return {
    subscribe,
    
    open: (options: Partial<RightPanelState> = {}) => {
      update(state => ({
        ...state,
        isOpen: true,
        title: options.title || state.title,
        content: options.content,
        component: options.component,
        props: options.props
      }));
    },
    
    close: () => {
      update(state => ({
        ...state,
        isOpen: false
      }));
    },
    
    toggle: () => {
      update(state => ({
        ...state,
        isOpen: !state.isOpen
      }));
    },
    
    updateContent: (content: string) => {
      update(state => ({
        ...state,
        content
      }));
    },
    
    updateTitle: (title: string) => {
      update(state => ({
        ...state,
        title
      }));
    },
    
    setComponent: (component: ComponentType, props?: Record<string, any>) => {
      update(state => ({
        ...state,
        component,
        props,
        content: undefined
      }));
    },
    
    reset: () => {
      set(initialState);
    }
  };
}

export const rightPanelStore = createRightPanelStore();