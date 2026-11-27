"""Later prompt sets (imported by prompts.py): clay covers, villa interiors, the walk-through film and the
blueprint-to-built hero film for the villa template. IDs below are Higgsfield job ids of earlier results."""
import os

TAKE = ' One continuous take, no cuts, no transitions, slow steady motion at constant speed, exposure, white balance and focus locked for the whole shot.'
NEVER = ' MUST NOT APPEAR: text, letters, numbers, logos, watermarks, people, hands, '
NOT_IMG = ' Must not appear: text, letters, numbers, logos, brand marks, watermarks, people, hands, faces.'
PHOTO = ' Photoreal architectural interior photograph, natural optics, fine material detail, straight verticals.'


def vid(index, prompt, ratio, seconds, refs=None):
    p = {'model': 'seedance_2_5', 'mode': 'omni_reference' if refs else 't2v', 'aspect_ratio': ratio, 'duration': seconds,
         'resolution': '720p', 'generate_audio': False, 'use_unlim': True, 'prompt': ' '.join(prompt.split())}
    if refs:
        p['medias'] = [{'role': r, 'value': v} for r, v in refs]
    return {'index': index, 'params': p}


def img(index, prompt, ratio, refs=None, model='gpt_image_2_6'):
    p = {'model': model, 'aspect_ratio': ratio, 'resolution': '2k', 'use_unlim': True, 'prompt': ' '.join(prompt.split())}
    if model.startswith('gpt_image'):
        p['quality'] = 'medium'
    if refs:
        p['medias'] = [{'role': 'image_references', 'value': v} for v in refs]
    return {'index': index, 'params': p}


def clay(scene, colours):
    return f'''Soft matte clay 3D render, a portfolio cover image, one of a matching set of four. SUBJECT: {scene} Every object is
chunky and hand-sculpted with rounded edges, visible fingerprints and soft tool marks, like polymer clay. SET: a seamless studio
backdrop and floor in one flat colour with no horizon line, the group of objects centred and filling the middle 60 percent of the
frame, clear space all around. CAMERA: 50 mm lens look, slightly above eye level, three-quarter view, f/5.6, everything sharp.
LIGHT: one huge soft key light from the upper left, gentle fill, soft contact shadows only. PALETTE: {colours}, plus warm ivory
(#F4EDE1) and cream (#F7F1E5), nothing else. MOOD: warm, friendly, crafted, premium.''' + NOT_IMG + ' Also not: writing or icons on any screen, sign, bag or box (keep them blank), glossy plastic, hard shadows.'


HOUSE_IN = '''the same modern tropical villa: board-formed pale concrete walls (#CFC8BC), warm teak ceilings and joinery (#9A6A3C),
honed pale limestone floors, off-white linen, dark bronze metal details, full-height sliding glass'''


def room(what, light):
    return f'''SUBJECT: {what}, inside {HOUSE_IN}. No people, the room tidy and lived-in with very few objects. LENS AND VIEW: 24 mm
tilt-shift, eye level, one-point perspective, the main subject centred. LIGHT: {light}. PALETTE: pale concrete, teak, limestone,
linen white, amber lamp light (#FFC98A), a deep indigo (#0A1730) or peach (#F2B28C) sky where a window shows. MOOD: calm, private,
finished.''' + PHOTO + NOT_IMG + ' Also not: televisions, clutter, art with faces, visible brand names.'


IMAGES_2 = [
    img(1, clay('a chunky clay smartphone standing upright with a completely blank cream screen, a small stack of fat round coins, one coin balanced on its edge, and a smooth rounded piggy-bank shape with no face.', 'sage green (#8FA58B) backdrop, objects in cream, ink blue (#1F3A5F) and a little mustard (#E2A93B)'), '4:3'),
    img(2, clay('three clay loaves of bread (a round boule with a scored cross, a long baguette, a plaited loaf), a blank folded paper bag standing behind them and a blank round shop sign on a short post.', 'mustard (#E2A93B) backdrop, objects in cream, coral (#E8674A) and warm brown crust tones'), '4:3'),
    img(3, clay('a rounded low lounge chair with a fat cushion and stubby legs standing on a low round plinth, beside a slim floor lamp with a dome shade and a small round side table.', 'ink blue (#1F3A5F) backdrop, objects in cream, sage (#8FA58B) and a coral (#E8674A) cushion'), '4:3'),
    img(4, clay('a blank cube-shaped kit box with its lid leaning against it, three clay planets of different sizes (one with a ring) floating just above it, and a small stubby rocket standing beside the box.', 'coral (#E8674A) backdrop, objects in ink blue (#1F3A5F), cream and mustard (#E2A93B)'), '4:3'),
    img(5, clay('a tidy designer desk as a small still life: a slab desk top with a dome desk lamp, an open blank sketchbook, a fat pencil, a mug and a small potted plant with round leaves.', 'warm ivory backdrop, objects in ink blue (#1F3A5F), coral (#E8674A), sage (#8FA58B), mustard (#E2A93B) and cream'), '1:1'),
    img(6, room('a double-height living room with a long low linen sofa, a travertine coffee table and a slatted teak ceiling six metres up, the full glass wall slid open to a pool terrace', 'dusk, the sky outside deep indigo fading to peach, warm lamps on inside'), '4:3'),
    img(7, room('a calm bedroom with a low teak bed dressed in off-white linen, glass doors open onto a small planted garden court with one frangipani tree', 'soft early morning daylight from the court, no lamps on'), '4:3'),
    img(8, room('a kitchen with a long island of pale honed stone with a waterfall edge, flush teak cabinet fronts without handles and a bronze tap, three simple stools', 'soft daylight from a clerestory window, a warm strip light under the shelf'), '4:3'),
    img(9, room('a bathroom with a free-standing oval bath carved from pale stone set beside a tall narrow window slot, a teak stool with one folded towel', 'a shaft of late afternoon sun through the slot window across the stone floor'), '4:3'),
    img(10, room('the pool terrace seen from its end: a 14 metre lap pool level with the stone deck, two low teak loungers, the lit glass living room on the left and the open sea horizon on the right', 'blue hour, the sky deep indigo above and peach at the horizon, the water still and mirroring the sky') + ' Wide composition, horizon at 45 percent of the frame height.', '3:2'),
]

WALK = '''Photoreal architectural interior film, a slow walk-through. SET: the double-height living room of a modern tropical villa at
dusk: slatted warm teak ceiling (#9A6A3C) six metres up, board-formed pale concrete walls (#CFC8BC), honed limestone floor, a long
low off-white linen sofa on the left, a travertine coffee table, one bronze floor lamp glowing amber (#FFC98A). The whole far wall is
glass, slid fully open, and beyond it a stone terrace runs level with the floor to a 14 metre lap pool and, past the pool edge, the
open sea under a sky graded from deep indigo (#0A1730) to peach (#F2B28C) at the horizon.
LENS AND CAMERA: 24 mm lens look, f/5.6, camera on a stabilised dolly at chest height (1.3 m), moving straight forward along the
centre line of the room at a constant slow walking pace, no pan, no tilt, horizon level, verticals straight. {framing}
SECOND BY SECOND: 0 to 3 s, the camera starts at the back of the room, the sofa and lamp in the foreground, the bright opening small
in the centre. 3 to 8 s, it glides forward past the sofa, the teak ceiling sliding overhead, the opening growing. 8 to 12 s, it
crosses the threshold onto the terrace and slows to a stop with the still pool and the sea horizon filling the frame.
FIRST FRAME: warm interior, the open glass wall centred and small. LAST FRAME: terrace, pool and sea horizon at dusk, the horizon
at 45 percent of the frame height, the lower left of the frame calm dark stone for a caption.
LIGHT AND PALETTE: warm interior lamp light against the cool dusk outside, palette teak, pale concrete, limestone, linen, amber,
indigo and peach. MOOD: calm, private, unhurried.''' + TAKE + NEVER + 'televisions, clutter, cars, boats, birds, curtains blowing, lens flare, flicker, fast motion.'

VIDEOS_2 = [vid(1, WALK.format(framing='Wide 16:9 frame.'), '16:9', 12),
            vid(2, WALK.format(framing='Tall vertical 9:16 frame for a phone: the opening stays centred, more ceiling above and more floor below.'), '9:16', 12)]

# ---- the villa hero: a blueprint that becomes the house (start frame = drawing, end frame = photograph)
VILLA_D = '41552bc2-979c-4ad7-8769-b0cf151b2bd8'   # images-1 #9, the 16:9 blue-hour photograph
BLUE = '''Redraw this exact photograph as an architect's presentation blueprint. Keep the composition, the perspective, the
position and proportions of every element (house, roof planes, glass bays, upper volume, pool, deck, trees, horizon) exactly as in
the reference image, line for line. STYLE: deep indigo drafting paper (#0A1730) filling the whole frame, the building drawn only in
fine crisp white (#F3F7FF) and pale cyan (#9CC4FF) lines of two weights, no fills, no shading, no photographic texture; the pool
drawn as a rectangle with a few thin wave lines, trees as light outline sketches, the sky left as empty indigo paper with a very
faint square drafting grid. A few thin dimension lines with end ticks beside the house, WITHOUT any numbers or words.''' + NOT_IMG
VILLA_M_PROMPT = '''The same villa as in the reference image, the same architecture, materials, pool, trees, light and time of day,
photographed again as a tall vertical 9:16 frame for a phone. Camera a little further back and exactly frontal across the pool.
COMPOSITION: the house spans the full width between 40 and 62 percent of the frame height, the top 36 percent of the frame is clean
dusk sky graded from deep indigo (#0A1730) at the top to peach (#F2B28C) low on the right, the bottom 30 percent is the still pool
mirroring the lit house and the dark basalt deck edge. All verticals straight. Photoreal architectural photograph at blue hour.''' + NOT_IMG + ' Also not: cars, neighbours, power lines, lens flare.'
MORPH = '''An architect's drawing becomes the finished house, in one continuous locked-off shot. The first frame is exactly the
start image: a white and pale cyan line drawing of a modern villa on deep indigo drafting paper (#0A1730). The last frame is exactly
the end image: the same villa, photoreal, at blue hour. The framing and perspective are identical in both and never change: the
camera is locked on a tripod with only a barely perceptible push-in of 3 percent over the whole shot.
SECOND BY SECOND: 0 to 2 s, the drawing holds; a soft glow travels along the white lines as if the ink were still wet. 2 to 5 s,
from the ground up, real material floods into the lines: the dark basalt deck first, then still water fills the pool outline and
begins to mirror, then pale board-formed concrete (#CFC8BC) rises through the wall outlines. 5 to 8 s, the teak soffit (#9A6A3C)
slides in under the roof line, glass appears in the bays and the interior lights come on warm amber (#FFC98A), the outline trees
grow leaves. 8 to 10 s, the indigo paper behind the house lightens into a real dusk sky, deep indigo above and peach (#F2B28C) at
the horizon, the last white construction lines fade away, the reflection in the pool settles. 10 to 12 s, the finished house holds
perfectly still.
LIGHT AND PALETTE: indigo, white line, pale concrete, teak, amber, peach. MOOD: precise, calm, a promise kept.
One continuous take, no cuts, no dissolves to other views, slow steady transformation, exposure locked.''' + NEVER + \
    'dimension numbers, construction workers, cranes, scaffolding, vehicles, birds, camera shake, zooms, flicker.'


def villa_sets(villa_m=None, blue_d=None, blue_m=None):
    s = {'images-3': [img(1, BLUE, '16:9', [VILLA_D], 'nano_banana_pro'), img(2, VILLA_M_PROMPT, '9:16', [VILLA_D], 'nano_banana_pro')]}
    if villa_m:
        s['images-4'] = [img(1, BLUE, '9:16', [villa_m], 'nano_banana_pro')]
    if blue_d and blue_m and villa_m:
        s['videos-3'] = [vid(1, MORPH, '16:9', 12, [('start_image', blue_d), ('end_image', VILLA_D)]),
                         vid(2, MORPH, '9:16', 12, [('start_image', blue_m), ('end_image', villa_m)])]
    return s


SETS = {'images-2': IMAGES_2, 'videos-2': VIDEOS_2}
SETS.update(villa_sets(os.environ.get('VILLA_M'), os.environ.get('BLUE_D'), os.environ.get('BLUE_M')))
