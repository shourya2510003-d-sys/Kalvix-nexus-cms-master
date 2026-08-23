const fs = require('fs');
let content = fs.readFileSync('src/app/admin/dashboard/page.tsx', 'utf8');

// 1. Add editModalTab state
content = content.replace(
  `const [showAddSectionModal, setShowAddSectionModal] = useState(false);`,
  `const [showAddSectionModal, setShowAddSectionModal] = useState(false);\n  const [editModalTab, setEditModalTab] = useState<'content' | 'design'>('content');`
);

// 2. Modify editingSection Modal UI header and content/design split
const oldModalTop = `                  {editingSection ? (
                    <div className="bg-white border border-[#D2D2D2] rounded-lg p-6 shadow-sm space-y-6">
                      <div className="flex justify-between items-center border-b border-[#EAEAEA] pb-4">
                        <h2 className="text-lg font-bold font-sans capitalize">{editingSection.id.replace('_', ' ')} - Edit Content</h2>
                        <button 
                          onClick={() => setEditingSection(null)}
                          className="text-gray-500 hover:text-black"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="space-y-6">
                        
                        {/* Direct Edit Fields */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold border-b pb-2">Direct Edit</h3>
                          {Object.entries(editingSection.data).map(([key, value]) => {
                            if (key === 'image' || key === 'videoImage') return null; // Handled by uploader
                            if (typeof value !== 'string') return null; // Only simple text fields for now
`;

const newModalTop = `                  {editingSection ? (
                    <div className="bg-white border border-[#D2D2D2] rounded-lg p-6 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#EAEAEA] pb-4 gap-4">
                        <div className="flex items-center space-x-6">
                          <h2 className="text-lg font-bold font-sans capitalize">{editingSection.id.replace('_', ' ')}</h2>
                          <div className="flex bg-gray-100 p-1 rounded-md">
                            <button 
                              onClick={() => setEditModalTab('content')} 
                              className={\`px-3 py-1 text-xs rounded-sm transition-all \${editModalTab === 'content' ? 'bg-white shadow font-bold text-black' : 'text-gray-500 hover:text-gray-700'}\`}
                            >
                              Content
                            </button>
                            <button 
                              onClick={() => setEditModalTab('design')} 
                              className={\`px-3 py-1 text-xs rounded-sm transition-all \${editModalTab === 'design' ? 'bg-white shadow font-bold text-black' : 'text-gray-500 hover:text-gray-700'}\`}
                            >
                              Design Settings
                            </button>
                          </div>
                        </div>
                        <button 
                          onClick={() => setEditingSection(null)}
                          className="text-gray-500 hover:text-black font-semibold text-xs"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="space-y-6">
                        {editModalTab === 'content' ? (
                        <>
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold border-b pb-2">Direct Edit</h3>
                          
                          {editingSection.id === 'hero_banner' && Array.isArray(editingSection.data?.slides) && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-gray-700">Slider Interval (seconds)</label>
                                <input 
                                  type="number" 
                                  min="1" 
                                  value={editingSection.data.sliderInterval || 5}
                                  onChange={(e) => {
                                    setEditingSection({
                                      ...editingSection,
                                      data: { ...editingSection.data, sliderInterval: parseInt(e.target.value) }
                                    });
                                  }}
                                  className="border border-gray-300 rounded p-1 text-xs w-20"
                                />
                              </div>
                              
                              {editingSection.data.slides.map((slide: any, slideIdx: number) => (
                                <div key={slide.id || slideIdx} className="border border-gray-200 p-4 rounded-md bg-gray-50 space-y-3">
                                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                    <h4 className="font-bold text-sm">Slide {slideIdx + 1}</h4>
                                    <button 
                                      onClick={() => {
                                        const newSlides = [...editingSection.data.slides];
                                        newSlides.splice(slideIdx, 1);
                                        setEditingSection({
                                          ...editingSection,
                                          data: { ...editingSection.data, slides: newSlides }
                                        });
                                      }}
                                      className="text-red-500 text-xs font-bold hover:underline"
                                    >
                                      Remove Slide
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Media URL (Image/Video)</label>
                                      <input 
                                        type="text" 
                                        value={slide.mediaUrl || ''} 
                                        onChange={(e) => {
                                          const newSlides = [...editingSection.data.slides];
                                          newSlides[slideIdx].mediaUrl = e.target.value;
                                          setEditingSection({...editingSection, data: {...editingSection.data, slides: newSlides}});
                                        }}
                                        className="w-full border border-gray-300 rounded p-2 text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Media Type</label>
                                      <select 
                                        value={slide.mediaType || 'image'}
                                        onChange={(e) => {
                                          const newSlides = [...editingSection.data.slides];
                                          newSlides[slideIdx].mediaType = e.target.value;
                                          setEditingSection({...editingSection, data: {...editingSection.data, slides: newSlides}});
                                        }}
                                        className="w-full border border-gray-300 rounded p-2 text-xs"
                                      >
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Title</label>
                                      <input 
                                        type="text" 
                                        value={slide.title || ''} 
                                        onChange={(e) => {
                                          const newSlides = [...editingSection.data.slides];
                                          newSlides[slideIdx].title = e.target.value;
                                          setEditingSection({...editingSection, data: {...editingSection.data, slides: newSlides}});
                                        }}
                                        className="w-full border border-gray-300 rounded p-2 text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Subtitle</label>
                                      <input 
                                        type="text" 
                                        value={slide.subtitle || ''} 
                                        onChange={(e) => {
                                          const newSlides = [...editingSection.data.slides];
                                          newSlides[slideIdx].subtitle = e.target.value;
                                          setEditingSection({...editingSection, data: {...editingSection.data, slides: newSlides}});
                                        }}
                                        className="w-full border border-gray-300 rounded p-2 text-xs"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              <button 
                                onClick={() => {
                                  setEditingSection({
                                    ...editingSection,
                                    data: {
                                      ...editingSection.data,
                                      slides: [...editingSection.data.slides, { id: \`slide-\${Date.now()}\`, mediaType: 'image', mediaUrl: '', title: 'New Slide' }]
                                    }
                                  });
                                }}
                                className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 border-dashed text-gray-700 py-2 rounded text-xs font-bold"
                              >
                                + Add Another Slide
                              </button>
                            </div>
                          )}

                          {Object.entries(editingSection.data).map(([key, value]) => {
                            if (key === 'image' || key === 'videoImage' || key === 'slides' || key === 'sliderInterval') return null; // Handled by uploader or specially
                            if (typeof value !== 'string') return null; // Only simple text fields for now
`;

content = content.replace(oldModalTop, newModalTop);

// 3. Fix upload section condition and append JSON editor block
const oldUploadBlock = `                        <div className="pt-2 border-t border-gray-200 mt-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">Upload Section Image</label>`;

const newUploadBlock = `                        {editingSection.id !== 'hero_banner' && (
                          <div className="pt-2 border-t border-gray-200 mt-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Upload Section Image</label>`;

content = content.replace(oldUploadBlock, newUploadBlock);

const oldUploadEndBlock = `                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
                          />
                        </div>

                        {/* JSON Editor Toggle */}`;

const newUploadEndBlock = `                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
                            />
                          </div>
                        )}

                        {/* JSON Editor Toggle */}`;

content = content.replace(oldUploadEndBlock, newUploadEndBlock);

// 4. Close the <></> block and add the design settings
const oldJsonEditorEnd = `                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end space-x-3">`;

const newJsonEditorEnd = `                              />
                            </div>
                          )}
                        </div>
                        </>
                        ) : (
                          <div className="space-y-6">
                            <h3 className="text-sm font-semibold border-b pb-2">Design & Theme</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              
                              <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Background Color</label>
                                <div className="flex items-center space-x-2">
                                  <input 
                                    type="color" 
                                    value={editingSection.styles?.backgroundColor || '#ffffff'}
                                    onChange={(e) => setEditingSection({...editingSection, styles: {...editingSection.styles, backgroundColor: e.target.value}})}
                                    className="h-8 w-8 rounded border border-gray-300 cursor-pointer"
                                  />
                                  <input 
                                    type="text" 
                                    value={editingSection.styles?.backgroundColor || ''}
                                    placeholder="Transparent or #Hex"
                                    onChange={(e) => setEditingSection({...editingSection, styles: {...editingSection.styles, backgroundColor: e.target.value}})}
                                    className="flex-1 border border-gray-300 rounded p-2 text-xs"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Text Color (Typography)</label>
                                <div className="flex items-center space-x-2">
                                  <input 
                                    type="color" 
                                    value={editingSection.styles?.textColor || '#000000'}
                                    onChange={(e) => setEditingSection({...editingSection, styles: {...editingSection.styles, textColor: e.target.value}})}
                                    className="h-8 w-8 rounded border border-gray-300 cursor-pointer"
                                  />
                                  <input 
                                    type="text" 
                                    value={editingSection.styles?.textColor || ''}
                                    placeholder="Inherit or #Hex"
                                    onChange={(e) => setEditingSection({...editingSection, styles: {...editingSection.styles, textColor: e.target.value}})}
                                    className="flex-1 border border-gray-300 rounded p-2 text-xs"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Font Family</label>
                                <select 
                                  value={editingSection.styles?.fontFamily || 'inherit'}
                                  onChange={(e) => setEditingSection({...editingSection, styles: {...editingSection.styles, fontFamily: e.target.value}})}
                                  className="w-full border border-gray-300 rounded p-2 text-xs"
                                >
                                  <option value="inherit">Theme Default</option>
                                  <option value="font-serif">Serif (Luxury/Elegant)</option>
                                  <option value="font-sans">Sans-Serif (Modern/Clean)</option>
                                  <option value="font-mono">Monospace (Technical)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Content Alignment</label>
                                <div className="flex bg-gray-100 rounded p-1">
                                  {['left', 'center', 'right'].map((align) => (
                                    <button
                                      key={align}
                                      onClick={() => setEditingSection({...editingSection, styles: {...editingSection.styles, textAlignment: align}})}
                                      className={\`flex-1 text-xs py-1.5 capitalize rounded-sm transition-all \${editingSection.styles?.textAlignment === align ? 'bg-white shadow font-bold text-black' : 'text-gray-500 hover:text-gray-700'}\`}
                                    >
                                      {align}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 flex justify-end space-x-3">`;

content = content.replace(oldJsonEditorEnd, newJsonEditorEnd);

fs.writeFileSync('src/app/admin/dashboard/page.tsx', content);
