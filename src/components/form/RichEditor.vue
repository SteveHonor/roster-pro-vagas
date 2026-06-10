<template>
  <div :class="wrapperClass">
    <label v-if="label" class="mb-1 block text-sm font-medium text-gray-800">{{ label }}</label>
    <div class="rounded border border-gray-200 bg-gray-100 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500">
      <!-- Toolbar -->
      <div class="flex items-center gap-0.5 border-b border-gray-200 px-2 py-1.5">
        <button
          v-for="action in toolbar"
          :key="action.name"
          type="button"
          :title="action.title"
          class="flex h-6 w-6 items-center justify-center rounded text-xs font-medium text-gray-500 transition hover:bg-white hover:text-gray-800"
          :class="{ 'bg-white text-gray-800 shadow-sm': action.active() }"
          @click="action.run()"
        >
          <span v-if="action.icon === 'bold'" class="font-bold">B</span>
          <span v-else-if="action.icon === 'italic'" class="italic">I</span>
          <span v-else-if="action.icon === 'ul'" class="leading-none">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="2" cy="4" r="1.2" fill="currentColor"/>
              <rect x="4.5" y="3.2" width="8" height="1.6" rx="0.8" fill="currentColor"/>
              <circle cx="2" cy="7" r="1.2" fill="currentColor"/>
              <rect x="4.5" y="6.2" width="8" height="1.6" rx="0.8" fill="currentColor"/>
              <circle cx="2" cy="10" r="1.2" fill="currentColor"/>
              <rect x="4.5" y="9.2" width="8" height="1.6" rx="0.8" fill="currentColor"/>
            </svg>
          </span>
          <span v-else-if="action.icon === 'ol'" class="leading-none font-mono text-[10px]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <text x="0" y="5.5" font-size="5" fill="currentColor" font-family="monospace">1.</text>
              <rect x="4.5" y="3.2" width="8" height="1.6" rx="0.8" fill="currentColor"/>
              <text x="0" y="8.5" font-size="5" fill="currentColor" font-family="monospace">2.</text>
              <rect x="4.5" y="6.2" width="8" height="1.6" rx="0.8" fill="currentColor"/>
              <text x="0" y="11.5" font-size="5" fill="currentColor" font-family="monospace">3.</text>
              <rect x="4.5" y="9.2" width="8" height="1.6" rx="0.8" fill="currentColor"/>
            </svg>
          </span>
        </button>
      </div>
      <!-- Editor area -->
      <editor-content :editor="editor" class="rich-editor-content" />
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import DOMPurify from 'dompurify';

export default {
  name: 'FormRichEditor',
  components: { EditorContent },

  props: {
    modelValue: { type: String, default: '' },
    label:      { type: String, default: null },
    placeholder: { type: String, default: '' },
    wrapperClass: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  },

  emits: ['update:modelValue'],

  data() {
    return { editor: null };
  },

  computed: {
    toolbar() {
      if (!this.editor) return [];
      return [
        {
          name: 'bold', icon: 'bold', title: 'Negrito',
          active: () => this.editor.isActive('bold'),
          run: () => this.editor.chain().focus().toggleBold().run(),
        },
        {
          name: 'italic', icon: 'italic', title: 'Itálico',
          active: () => this.editor.isActive('italic'),
          run: () => this.editor.chain().focus().toggleItalic().run(),
        },
        {
          name: 'ul', icon: 'ul', title: 'Lista com marcadores',
          active: () => this.editor.isActive('bulletList'),
          run: () => this.editor.chain().focus().toggleBulletList().run(),
        },
        {
          name: 'ol', icon: 'ol', title: 'Lista numerada',
          active: () => this.editor.isActive('orderedList'),
          run: () => this.editor.chain().focus().toggleOrderedList().run(),
        },
      ];
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Placeholder.configure({ placeholder: this.placeholder }),
      ],
      content: this.modelValue ? DOMPurify.sanitize(this.modelValue) : '',
      editable: !this.disabled,
      onUpdate: ({ editor }) => {
        const html = editor.isEmpty ? '' : editor.getHTML();
        this.$emit('update:modelValue', html);
      },
    });
  },

  watch: {
    modelValue(val) {
      const current = this.editor?.getHTML() ?? '';
      if (val !== current) {
        this.editor?.commands.setContent(val ? DOMPurify.sanitize(val) : '', false);
      }
    },
    disabled(val) {
      this.editor?.setEditable(!val);
    },
  },

  beforeUnmount() {
    this.editor?.destroy();
  },
};
</script>

<style>
.rich-editor-content .tiptap {
  min-height: 120px;
  padding: 0.5rem 0.625rem;
  font-size: 0.875rem;
  color: #1e293b;
  outline: none;
}

.rich-editor-content .tiptap p { margin: 0 0 0.25rem; }
.rich-editor-content .tiptap p:last-child { margin-bottom: 0; }

.rich-editor-content .tiptap ul,
.rich-editor-content .tiptap ol {
  padding-left: 1.25rem;
  margin: 0.25rem 0;
}
.rich-editor-content .tiptap ul { list-style-type: disc; }
.rich-editor-content .tiptap ol { list-style-type: decimal; }
.rich-editor-content .tiptap li { margin: 0.125rem 0; }

.rich-editor-content .tiptap strong { font-weight: 600; }
.rich-editor-content .tiptap em { font-style: italic; }

.rich-editor-content .tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: #94a3b8;
  pointer-events: none;
  float: left;
  height: 0;
}
</style>
