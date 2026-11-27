#!/usr/bin/env python3
"""Hanflux premium film templates: every generation prompt, in one place.

Usage: python3 tools/premium/prompts.py   ->  tools/premium/gen/<set>.json  ({"requests": [...]} for the batch tools)

Footage rules for a film the scroll will play: one continuous take, no cuts, slow steady motion, locked exposure,
a centred subject with clean negative space where the text sits, no text or logos, audio off. Phones get a real
9:16 cut, never a centre crop. Every prompt names subject, materials, set, lens, the camera path second by second,
light, palette (hex), mood, first and last frame, and what must not appear.
"""
import json, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gen')
TAKE = ' One continuous take, no cuts, no transitions, slow steady motion at constant speed, exposure, white balance and focus locked for the whole shot.'
NEVER = ' MUST NOT APPEAR: text, letters, numbers, logos, watermarks, people, hands, '


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


# The three 16:9 hero films that already exist (jobs from 27 Nov), used as references for their phone cuts.
WATCH, DISH, CUBE = 'dff411bb-5211-422f-b7c9-bfd63cd68dbb', 'e31a5521-6258-4364-a8da-3dfe15deddbe', 'f85c7382-10ef-429c-83cd-90ea122721dc'

CHRONO_M = '''Native vertical 9:16 version of the reference film @Video1, for a phone held upright: the same watch, the same
materials, the same lighting and the same slow choreography, recomposed for a tall frame.
SUBJECT: one luxury mechanical wristwatch, 39 mm round case in brushed and polished rose gold (#C9A45C highlights, #7A5A2E shadows),
plain blank champagne dial (#D9C39A) with two slim gold hands and no numerals, black alligator-grain leather strap (#0B0A09).
SET: seamless deep black studio (#0A0908) with a faint warm brown haze glow (#3A2A1A) behind the watch, nothing else in the room.
LENS AND CAMERA: 100 mm macro lens look, f/5.6, camera on a motion-control rig, perfectly steady, eye level, dead-on to the dial.
SECOND BY SECOND: 0 to 2 s, the complete watch floats upright, strap vertical, centred horizontally with its centre at 42 percent of
the frame height, filling about half the frame width, almost still, a slow highlight sliding over the bezel. 2 to 7 s, the watch turns
a slow quarter turn to its left while the case opens and the parts separate into a floating exploded view stacked along the VERTICAL
axis of the frame: domed sapphire crystal highest, then hands, champagne dial, gear train, bridges with ruby jewels, mainspring barrel,
case middle, caseback lowest, evenly spaced, each layer level and parallel. The camera pushes in gently at constant speed, about 10
percent in total. 7 to 10 s, the layers drift slightly further apart and hold, gears turning very slowly, camera still creeping in.
FIRST FRAME: whole closed watch, centred, generous black space above and below.
LAST FRAME: full exploded stack filling the middle 70 percent of the frame height, bottom 20 percent of the frame clean black for text.
LIGHT AND PALETTE: warm gold rim light from upper right, soft fill from the left, background stays pure black, palette limited to
black, rose gold, champagne, steel and tiny ruby red jewels. MOOD: quiet, precise, expensive.''' + TAKE + NEVER + \
    'brand marks, engraving, numerals on the dial, a table or stand, lens flares, flicker, fast motion.'

EMBER_M = '''Native vertical 9:16 version of the reference film @Video1, for a phone held upright: the same dish, the same plate,
the same counter, the same fire and the same slow push-in, recomposed for a tall frame.
SUBJECT: one hand-thrown matte black stoneware bowl-plate (#141211) holding fire-charred leeks with a glossy amber glaze (#C9801F),
blistered dark tips and three or four tiny green micro herbs (#6E8B3D).
SET: a dark honed slate counter (#1A1817) in a restaurant kitchen at night; far behind, completely out of focus, a wood fire in a
brick hearth glows deep orange (#FF5A1F to #B5330C).
LENS AND CAMERA: 85 mm lens look at f/2.8, shallow depth of field, camera on a slider slightly above plate height, looking 15 degrees
down, perfectly steady.
SECOND BY SECOND: 0 to 2 s, the plate sits small and centred horizontally at 60 percent of the frame height, the blurred fire fills the
top third of the tall frame, a thin ribbon of smoke rises straight up from the dish, two or three embers drift. 2 to 8 s, slow constant
push-in toward the dish with a slight 10 degree orbit to the right, the plate grows until it fills the frame width, the fire bokeh
slides up and softens, smoke keeps curling. 8 to 10 s, the move eases to a near stop on a close view of the glazed leeks, steam and
one ember crossing.
FIRST FRAME: small plate low in frame, big dark calm space, fire glow above.
LAST FRAME: close on the dish, plate rim touching both frame edges, top 25 percent of the frame dark and clean for text.
LIGHT AND PALETTE: low key, a single warm key from the fire side, orange highlights on black, everything else near black, no blue.
MOOD: hushed, hungry, late evening.''' + TAKE + NEVER + 'cutlery, glasses, bright daylight, flicker, fast flames, camera shake.'

CORE_M = '''Native vertical 9:16 version of the reference film @Video1, for a phone held upright: the same glass cube, the same
light threads, the same dark void and the same slow orbit, recomposed for a tall frame.
SUBJECT: one translucent glass cube with softly rounded edges and corners, about 12 cm, floating; inside it, hair-thin threads of
white and pale cyan light (#BFE9FF) travel along precise circuit-like right-angled paths toward a small brilliant core (#FFFFFF).
Thin-film holographic reflections in violet (#B18CFF), cyan (#5FD4FF) and a little magenta (#FF7AD9) slide across the faces.
SET: an empty dark graphite void (#06070B) with a very soft blue-grey vignette glow (#1B2430) behind the cube, no floor, no horizon.
LENS AND CAMERA: 65 mm lens look, f/4, camera on a motion-control arc, perfectly steady.
SECOND BY SECOND: 0 to 2 s, the cube floats centred horizontally with its centre at 40 percent of the frame height, filling about 55
percent of the frame width, face-on, light threads pulsing slowly. 2 to 8 s, the camera orbits a slow quarter turn to the right at
constant speed so a second face and the top face come into view, holographic colour sliding across the glass, the core slowly
brightening. 8 to 10 s, the orbit eases, the core blooms to a bright four-point star of light inside the glass, hold.
FIRST FRAME: face-on cube, dim calm core, large dark space above and below.
LAST FRAME: three-quarter view, bright core, cube still centred at 40 percent height, the bottom 30 percent of the frame clean dark
space for text.
LIGHT AND PALETTE: only the cube emits light, palette graphite black, white, cyan, violet, a touch of magenta.
MOOD: silent, exact, fast-thinking.''' + TAKE + NEVER + 'a floor or table, extra objects, particles filling the void, lens dirt, flicker.'

CLAY_OBJECTS = '''eleven hand-sculpted chunky clay objects from a designer's desk, each with rounded edges, visible fingerprints and
soft tool marks: a fat cursor arrow in ink blue (#1F3A5F), a pen nib in cream (#F7F1E5), a short thick pencil in mustard (#E2A93B)
with a coral tip, a fan of three blank colour swatch cards in coral, sage (#8FA58B) and ink blue, a rounded speech bubble in sage, a
small phone slab in ink blue with a blank cream screen, a camera aperture ring in cream, a five-point star in mustard, a torus in
sage, a rounded cube in coral, and a small cream sphere.'''
CLAY_END = '''LIGHT AND PALETTE: one huge soft key light from the upper left, gentle bounce fill, soft contact shadows only, palette
strictly ivory, coral, ink blue, sage, mustard and cream. MOOD: warm, playful, crafted, calm.''' + TAKE + NEVER + \
    'icons or interface on the phone screen, faces, characters, glossy plastic, hard shadows, extra colours, flicker, fast motion.'

TOTEM_D = '''Premium soft matte clay 3D animation, smooth motion (not jittery stop motion).
SET: a seamless warm ivory studio cyclorama (#F4EDE1), floor and wall the same colour with no visible horizon line. In the exact
centre stands a low round plinth of terracotta coral clay (#E8674A), 30 cm wide.
SUBJECT: ''' + CLAY_OBJECTS + '''
LENS AND CAMERA: 50 mm lens look, f/4, eye level, camera on a motion-control rig.
SECOND BY SECOND: 0 to 2 s, wide view, the plinth is empty and centred, the eleven objects float scattered across the whole frame at
different depths, tumbling very slowly, almost still. 2 to 9 s, one after another the objects glide inward along gentle arcs and
settle on the plinth, building a compact, balanced, sculptural still life about one third of the frame height: phone slab and cube at
the base, swatch fan and speech bubble leaning against them, torus and aperture ring stacked, pencil and pen nib standing upright,
cursor arrow resting at an angle, star tucked at the front. Each landing has a tiny soft squash and settle. During this the camera
pushes in slowly at constant speed, 15 percent in total, and orbits 20 degrees to the right. 9 to 12 s, the cream sphere lands last on
the very top and rocks to rest, everything holds still, the camera creeps the last few percent.
FIRST FRAME: empty coral plinth in the centre, objects scattered wide, lots of ivory space.
LAST FRAME: finished sculpture centred on the plinth, clean ivory space on the left third and right third for text.
''' + CLAY_END

TOTEM_M = '''Premium soft matte clay 3D animation in a tall vertical 9:16 frame for a phone, smooth motion (not jittery stop motion).
SET: a seamless warm ivory studio cyclorama (#F4EDE1), floor and wall the same colour with no visible horizon line. A low round
plinth of terracotta coral clay (#E8674A) stands centred horizontally with its top at 62 percent of the frame height.
SUBJECT: ''' + CLAY_OBJECTS + '''
LENS AND CAMERA: 50 mm lens look, f/4, eye level, camera on a motion-control rig.
SECOND BY SECOND: 0 to 2 s, the plinth is empty, the eleven objects float scattered through the upper two thirds of the tall frame at
different depths, tumbling very slowly, almost still. 2 to 9 s, one after another the objects glide down and inward along gentle arcs
and settle on the plinth, building a tall, balanced, sculptural stack: phone slab and cube at the base, swatch fan and speech bubble
leaning against them, torus and aperture ring stacked above, pencil and pen nib standing upright, cursor arrow resting at an angle,
star tucked at the front. Each landing has a tiny soft squash and settle. During this the camera pushes in slowly at constant speed,
12 percent in total, and orbits 15 degrees to the right. 9 to 12 s, the cream sphere lands last on the very top and rocks to rest,
everything holds still.
FIRST FRAME: empty coral plinth low in the frame, objects scattered above, lots of ivory space.
LAST FRAME: finished stack centred, reaching from 30 to 68 percent of the frame height, the top 22 percent and the bottom 25 percent
of the frame clean ivory for text.
''' + CLAY_END

RINGS = '''a 60 cm armillary sculpture: five slim concentric rings of brushed champagne brass (#B89A62) and one ring of dark
patinated bronze (#3A2F25), each ring a different diameter, all pivoting around a small polished sphere of deep green stone (#12382E)
at the centre.'''
AXIS_SET = '''SET: a quiet bright gallery room of honed pale limestone, walls and floor the same warm stone white (#E9E4DA), no
windows in view, no furniture. Soft north daylight enters from a tall window off screen on the left and lays one long, very soft
shadow across the floor to the right. A low rectangular limestone plinth stands centred in the room.'''
AXIS_END = '''LIGHT AND PALETTE: soft daylight only, no artificial lamps, palette warm stone white, champagne brass, dark bronze and
one deep green accent, soft shadows, gentle natural contrast. MOOD: calm, ordered, trustworthy, quietly luxurious.''' + TAKE + NEVER + \
    'engravings, zodiac symbols, plants, furniture, pictures on the wall, lens flare, flicker, fast motion.'

AXIS_D = 'Photoreal architectural still-life film, serene and exact. ' + AXIS_SET + ' SUBJECT: on the plinth, ' + RINGS + '''
LENS AND CAMERA: 40 mm lens look, f/5.6, camera at the height of the sculpture's centre, exactly frontal, on a motion-control dolly.
SECOND BY SECOND: 0 to 3 s, wide view, the sculpture is small in the middle third of the frame, the six rings are all tilted at
different angles and turn slowly and silently on different axes, out of alignment, brass catching the daylight. 3 to 9 s, the rings
slow down and, one by one from the outermost to the innermost, rotate into the same vertical plane facing the camera, nesting into a
perfect flat set of concentric circles. During this the camera pushes straight in at constant slow speed, about 20 percent in total.
9 to 12 s, the last ring arrives in alignment, a single soft glint of light travels once around the outer ring, then everything holds
perfectly still.
FIRST FRAME: small misaligned sculpture in the centre of a calm pale room, wide empty stone wall on the left and on the right.
LAST FRAME: perfectly aligned concentric rings facing the camera around the green sphere, centred, the left 35 percent of the frame
empty pale wall for text.
''' + AXIS_END

AXIS_M = 'Photoreal architectural still-life film in a tall vertical 9:16 frame for a phone, serene and exact. ' + AXIS_SET + \
    ' SUBJECT: on the plinth, ' + RINGS + ''' The centre of the sculpture sits at 40 percent of the frame height.
LENS AND CAMERA: 40 mm lens look, f/5.6, camera at the height of the sculpture's centre, exactly frontal, on a motion-control dolly.
SECOND BY SECOND: 0 to 3 s, the sculpture fills about 45 percent of the frame width, the six rings are all tilted at different angles
and turn slowly and silently on different axes, out of alignment, brass catching the daylight. 3 to 9 s, the rings slow down and, one
by one from the outermost to the innermost, rotate into the same vertical plane facing the camera, nesting into a perfect flat set of
concentric circles. During this the camera pushes straight in at constant slow speed, about 18 percent in total. 9 to 12 s, the last
ring arrives in alignment, a single soft glint of light travels once around the outer ring, then everything holds perfectly still.
FIRST FRAME: misaligned sculpture in the upper middle of a calm pale room, pale wall above, plinth and pale floor below.
LAST FRAME: perfectly aligned concentric rings facing the camera around the green sphere, centred at 40 percent height, the bottom 30
percent of the frame calm pale stone for text.
''' + AXIS_END

CHRONO_MACRO = '''Extreme macro product film of a mechanical watch movement.
SUBJECT: the open back of a hand-finished calibre: rose gold plated bridges (#C9A45C) with fine straight brushed graining and polished
bevels, blued steel screws (#27408B), synthetic ruby jewels (#B3123A), a steel gear train and, right of centre, the balance wheel with
its hairspring breathing.
SET: the movement fills the frame edge to edge; beyond it only deep black (#0A0908).
LENS AND CAMERA: 100 mm macro at f/4, razor thin depth of field, camera on a motorised slider moving left to right across the
movement at a constant very slow speed, about 2 cm over the whole shot, with a 5 degree tilt so the focus plane sweeps gently across
the bridges.
SECOND BY SECOND: 0 to 2 s, focus rests on the barrel bridge on the left, the balance wheel is a soft golden blur on the right. 2 to
6 s, as the slider travels, focus rolls smoothly across the gear train, small wheels turning slowly, a warm highlight sliding along
each polished bevel. 6 to 8 s, the balance wheel arrives in sharp focus, swinging back and forth at a steady beat, hairspring pulsing;
hold.
FIRST FRAME: sharp brushed bridge on the left, dark soft right half.
LAST FRAME: sharp balance wheel right of centre, soft gold bokeh on the left, left third dark enough for text.
LIGHT AND PALETTE: one warm soft key from the upper right, black negative fill from the left, palette black, rose gold, steel, tiny
ruby and blue accents. MOOD: hypnotic, precise, hand made.''' + TAKE + NEVER + \
    'engraved words, serial numbers, tweezers, dust, scratches, lens flare, flicker.'

EMBER_FIRE = '''Cinematic slow-motion macro film of a wood fire, locked camera.
SUBJECT: three split oak logs burning low in a brick hearth, bark charred black with glowing orange checkered embers (#FF5A1F,
#FFB347 at the hottest points, #7A1C06 in the cracks), small calm flames licking upward, a few sparks lifting and fading.
SET: the dark mouth of a restaurant wood oven, sooty black firebrick (#0C0A09) all around, the bed of embers runs across the lower
third of the frame.
LENS AND CAMERA: 85 mm lens look at f/2.8, camera on a tripod at ember height, absolutely static, shallow depth of field with the
nearest log sharp and the back of the oven soft.
SECOND BY SECOND: 0 to 3 s, low flames sway slowly, embers pulse brighter and dimmer as if breathing. 3 to 6 s, one small log shifts
a few millimetres and releases a slow drift of eight to ten sparks that rise through the upper half of the frame and fade. 6 to 8 s,
the flames settle back to the same calm height as the start, embers still pulsing.
FIRST FRAME and LAST FRAME look nearly the same: glowing ember bed across the lower third, small flames in the middle, the upper 45
percent of the frame almost pure black for text.
LIGHT AND PALETTE: the fire is the only light source, palette black, deep red, orange and a little amber yellow, no blue, no white
clipping. MOOD: warm, patient, elemental. Slow motion feel.''' + TAKE + NEVER + \
    'tools, food, pans, explosions, big roaring flames, smoke filling the frame, daylight, flicker, camera movement.'

VIDEOS_1 = [vid(1, CHRONO_M, '9:16', 10, [('video_references', WATCH)]), vid(2, EMBER_M, '9:16', 10, [('video_references', DISH)]),
            vid(3, CORE_M, '9:16', 10, [('video_references', CUBE)]), vid(4, TOTEM_D, '16:9', 12), vid(5, TOTEM_M, '9:16', 12),
            vid(6, AXIS_D, '16:9', 12), vid(7, AXIS_M, '9:16', 12), vid(8, CHRONO_MACRO, '16:9', 8), vid(9, EMBER_FIRE, '16:9', 8)]

# ---------------------------------------------------------------- stills
PHOTO = ' Photoreal commercial photograph, natural optics, fine detail, no retouching artefacts.'
NOT_IMG = ' Must not appear: text, letters, numbers, logos, brand marks, watermarks, people, hands.'


def watch(dial, case, strap, stone):
    return f'''Luxury watch product photograph for an online shop, one of a matching set of three. SUBJECT: a single 39 mm round
dress watch standing upright with its strap buckled into a loop, {case}, {dial}, slim polished baton hour markers and two slim hands
set at ten past ten, no numerals and no writing anywhere on the dial, {strap}. SET: the watch stands on {stone}; behind it a seamless
deep black-brown studio backdrop (#0A0908) with a soft warm haze glow (#3A2A1A) low behind the watch. LENS: 100 mm macro, f/8,
straight-on at dial height, the watch centred and filling 55 percent of the frame height, generous dark space above. LIGHT: one large
soft warm key from the upper right, a thin rim light on the left edge of the case, soft reflection of the watch in the stone.
MOOD: quiet, expensive, exact.''' + PHOTO + NOT_IMG + ' Also not: a second watch, a box, props, date window, sub-dials.'


def dish(what, plate):
    return f'''Fine dining food photograph for a wood-fire restaurant menu, one of a matching set of three. SUBJECT: {what}, plated
with restraint in the centre of {plate}. SET: a dark honed slate counter (#1A1817) at night, far behind and fully out of focus the
orange glow of a wood fire (#FF5A1F) as soft bokeh in the top left corner. LENS: 90 mm, f/4, camera 40 degrees above the plate, the
plate centred and filling 70 percent of the frame width, the dish tack sharp. LIGHT: low key, one warm side light from the left as if
from the fire, deep soft shadows, small glossy highlights on the food, a faint wisp of steam. PALETTE: near black, charcoal, amber,
ember orange, one small green accent. MOOD: hushed, hungry, hand made.''' + PHOTO + NOT_IMG + ' Also not: cutlery, glasses, napkins, flowers, a second plate.'


VILLA = '''a single modern tropical villa of two low storeys: long horizontal planes of board-formed pale concrete (#CFC8BC), a deep
cantilevered flat roof with a warm teak soffit (#9A6A3C), floor-to-ceiling sliding glass along the whole ground floor glowing with
warm amber interior light (#FFC98A), a slim upper volume set back on the left with one wide window, a 14 metre lap pool running across
the foreground parallel to the house and mirroring it, a dark basalt pool deck (#23262B), two sculptural frangipani trees and low
tropical planting at the right end'''

IMAGES_1 = [
    img(1, watch('a champagne sunray dial (#D9C39A)', 'case in polished and brushed rose gold (#C9A45C)', 'a black alligator-grain leather strap', 'a small block of honed black marble with fine gold veins'), '4:5'),
    img(2, watch('a deep black onyx dial with a soft gloss', 'case in brushed stainless steel (#B9BDC2)', 'a matte black calf leather strap', 'a small block of dark grey basalt'), '4:5'),
    img(3, watch('a deep jade green sunray dial (#12382E)', 'case in polished and brushed rose gold (#C9A45C)', 'a dark forest green suede strap', 'a small block of honed dark green marble'), '4:5'),
    img(4, '''Still life photograph of a watchmaker's bench, seen from 50 degrees above. SUBJECT: an uncased mechanical watch movement
with rose gold bridges resting on a small round wooden movement holder in the centre; around it, neatly arranged: three brass-handled
screwdrivers, fine steel tweezers, a brass loupe, a small glass dome over tiny gears, a folded grey chamois cloth. SET: a worn oak
bench top (#5A3E28) with a dark green leather bench mat (#12382E), everything beyond the bench falling into warm darkness (#0A0908).
LENS: 60 mm, f/5.6, the movement sharp, the outer tools slightly soft. LIGHT: a single warm task lamp from the upper left making a
pool of light on the mat, long soft shadows, small gold highlights. PALETTE: dark oak, deep green, rose gold, brass, black. MOOD:
patient, hand made, late evening. Composition: the right third of the frame is darker and emptier.''' + PHOTO + NOT_IMG, '3:2'),
    img(5, dish('two fire-charred leeks split lengthways with blistered black tips and a glossy amber glaze, a spoon of white smoked curd beside them and three drops of bright green curry leaf oil', 'a hand-thrown matte black stoneware plate with an uneven rim'), '4:5'),
    img(6, dish('one large grilled tiger prawn, shell on, split and charred at the edges, brushed with glossy deep pink kokum butter, with half a charred lemon and a few flakes of sea salt', 'a hand-thrown charcoal grey stoneware plate with an uneven rim'), '4:5'),
    img(7, dish('a small round burnt jaggery custard with a dark caramelised top, a quenelle of white coconut cream on it and a scatter of golden toasted puffed rice', 'a hand-thrown matte black stoneware bowl with a wide rim'), '4:5'),
    img(8, '''Macro photograph of a futuristic AI processor. SUBJECT: a square chip package of smoked glass and brushed dark titanium
seated in a matte black circuit board; under the glass lid a fine grid of light channels glows white and pale cyan (#BFE9FF), and
thin-film holographic interference colours in violet (#B18CFF), cyan (#5FD4FF) and a little magenta (#FF7AD9) slide across the glass
surface. Hair-thin gold traces run outward from the chip across the board. SET: the board fills the frame and falls into graphite
darkness (#06070B) at the edges. LENS: 100 mm macro, f/4, three-quarter view from 35 degrees above, the chip in the left-centre of the
frame, the right 40 percent darker and soft for text. LIGHT: the chip glows from within, one cool rim light from behind. MOOD: exact,
quiet, powerful.''' + PHOTO + NOT_IMG + ' Also not: readable markings or part numbers on the chip, fans, cables.', '3:2'),
    img(9, 'Architectural photograph at blue hour. SUBJECT: ' + VILLA + '''. SET: a private hillside plot above the Arabian Sea on
the Konkan coast; the calm sea is visible as a thin band on the far right horizon; the sky is a clean gradient from deep indigo
(#0A1730) at the top to soft peach (#F2B28C) at the horizon on the right, no clouds. The pool water is perfectly still and mirrors
the lit house. LENS AND VIEW: 24 mm tilt-shift lens, camera 1.5 metres high on the far side of the pool, exactly frontal one-point
perspective, all verticals straight, the house centred and spanning the middle 62 percent of the frame width, its roof line at 45
percent of the frame height, the upper 40 percent of the frame clean sky for text. LIGHT: last daylight in the sky, warm interior
light spilling onto the deck and the water, two small ground lights under the trees. PALETTE: indigo, peach, pale concrete, teak,
amber, basalt. MOOD: calm, private, finished.''' + PHOTO + NOT_IMG + ' Also not: cars, neighbours, power lines, furniture clutter, lens flare.', '16:9'),
    img(10, '''Interior architectural photograph of a private advisory firm's meeting room, early morning, nobody present. SUBJECT:
a long table of honed travertine on a dark bronze base with eight low chairs in deep green leather (#12382E), a single slim brass
pendant line light (#B89A62) above it, one closed leather folder and a glass of water at the head of the table. SET: walls of pale
limestone plaster (#E9E4DA), a full-height window on the left with sheer linen curtains letting in soft daylight, pale oak floor, one
tall shelf niche on the far wall holding three plain stone objects. LENS: 28 mm tilt-shift, eye level, one-point perspective down the
length of the table, verticals straight, the far wall centred. LIGHT: soft north daylight from the left, gentle shadows, no lamps on
except a faint glow from the pendant. PALETTE: stone white, travertine, deep green, brass, bronze. MOOD: calm, discreet, ordered.''' + PHOTO + NOT_IMG + ' Also not: screens, laptops, branded items, books with titles, clutter.', '3:2'),
    img(11, '''Still life photograph on a desk in a private advisory firm. SUBJECT: a closed fountain pen in brushed brass lying on a
single sheet of thick cream paper with two neat fold lines, beside a small brass drafting compass and a polished sphere of deep
green stone (#12382E) the size of a plum. SET: a honed travertine desk top, pale limestone wall (#E9E4DA) behind, softly out of focus.
LENS: 85 mm, f/4, 30 degrees above the desk, objects grouped in the lower two thirds, calm empty wall above. LIGHT: soft window light
from the left, long gentle shadows. PALETTE: stone white, cream, brass, deep green. MOOD: considered, precise, unhurried.''' + PHOTO + NOT_IMG + ' Also not: writing on the paper, a signature, a phone, a keyboard.', '4:5'),
    img(12, '''Interior architectural photograph of a quiet reading corner in a private advisory firm, nobody present. SUBJECT: one
low lounge chair in deep green leather (#12382E) with a slim bronze frame beside a small round travertine side table, a brass floor
lamp with a linen shade, and a wall of pale oak shelving holding cloth-bound books turned spine-in so no titles show, interleaved with
a few plain stone and brass objects. SET: pale limestone plaster walls (#E9E4DA), pale oak floor, a strip of soft daylight falling
across the floor from a window out of frame on the right. LENS: 35 mm, eye level, verticals straight, chair in the lower left third,
shelving filling the right two thirds. LIGHT: soft daylight plus a warm low glow from the lamp. PALETTE: stone white, oak, deep green,
brass. MOOD: private, warm, unhurried.''' + PHOTO + NOT_IMG + ' Also not: book titles, screens, pictures with faces, plants taller than the table.', '4:5'),
]

SETS = {'videos-1': VIDEOS_1, 'images-1': IMAGES_1}
try:
    from prompts2 import SETS as MORE  # later sets, written once the first results existed
    SETS.update(MORE)
except ImportError:
    pass

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name, reqs in SETS.items():
        json.dump({'requests': reqs}, open(os.path.join(OUT, name + '.json'), 'w'), indent=1)
        print(name, len(reqs), 'requests,', sum(len(r['params']['prompt']) for r in reqs), 'chars of prompt')
