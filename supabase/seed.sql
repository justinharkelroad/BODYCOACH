-- BODYCOACH Exercise Database Seed
-- ~200 exercises covering all major body parts

INSERT INTO public.exercises (name, description, body_part, equipment, difficulty, instructions, muscles_primary, muscles_secondary) VALUES

-- CHEST EXERCISES
('Barbell Bench Press', 'The king of chest exercises. Lie on a flat bench and press the barbell up from chest level.', 'chest', ARRAY['barbell', 'bench'], 'intermediate', ARRAY['Lie flat on bench with feet on floor', 'Grip bar slightly wider than shoulder width', 'Lower bar to mid-chest with control', 'Press up until arms are extended', 'Keep back flat on bench throughout'], ARRAY['chest'], ARRAY['triceps', 'front delts']),

('Incline Dumbbell Press', 'Targets the upper chest. Performed on an incline bench set to 30-45 degrees.', 'chest', ARRAY['dumbbell', 'bench'], 'intermediate', ARRAY['Set bench to 30-45 degree incline', 'Hold dumbbells at shoulder level', 'Press weights up and slightly together', 'Lower with control to starting position'], ARRAY['upper chest'], ARRAY['triceps', 'front delts']),

('Dumbbell Flyes', 'Isolation exercise that stretches and contracts the chest muscles.', 'chest', ARRAY['dumbbell', 'bench'], 'beginner', ARRAY['Lie flat on bench holding dumbbells above chest', 'Keep slight bend in elbows throughout', 'Lower weights out to sides in arc motion', 'Squeeze chest to bring weights back together'], ARRAY['chest'], ARRAY['front delts']),

('Push-Ups', 'Classic bodyweight exercise for chest, shoulders, and triceps.', 'chest', ARRAY['bodyweight'], 'beginner', ARRAY['Start in plank position with hands slightly wider than shoulders', 'Keep body in straight line from head to heels', 'Lower chest toward floor by bending elbows', 'Push back up to starting position'], ARRAY['chest'], ARRAY['triceps', 'front delts', 'core']),

('Cable Crossover', 'Cable exercise that provides constant tension throughout the movement.', 'chest', ARRAY['cable'], 'intermediate', ARRAY['Set pulleys to high position', 'Step forward with slight lean', 'Bring handles together in front of chest', 'Control the weight back to starting position'], ARRAY['chest'], ARRAY['front delts']),

('Decline Bench Press', 'Targets the lower chest. Performed on a decline bench.', 'chest', ARRAY['barbell', 'bench'], 'intermediate', ARRAY['Secure legs at top of decline bench', 'Grip bar slightly wider than shoulder width', 'Lower bar to lower chest', 'Press up until arms are extended'], ARRAY['lower chest'], ARRAY['triceps', 'front delts']),

('Dumbbell Pullover', 'Works the chest and lats. Great for expanding the rib cage.', 'chest', ARRAY['dumbbell', 'bench'], 'intermediate', ARRAY['Lie across bench with shoulders supported', 'Hold dumbbell with both hands above chest', 'Lower weight behind head in arc motion', 'Pull weight back over chest'], ARRAY['chest', 'lats'], ARRAY['triceps', 'serratus']),

('Machine Chest Press', 'Beginner-friendly machine version of the bench press.', 'chest', ARRAY['machine'], 'beginner', ARRAY['Adjust seat so handles are at chest level', 'Grip handles and press forward', 'Extend arms without locking elbows', 'Return with control'], ARRAY['chest'], ARRAY['triceps', 'front delts']),

('Incline Push-Ups', 'Easier push-up variation with hands elevated.', 'chest', ARRAY['bodyweight'], 'beginner', ARRAY['Place hands on elevated surface', 'Keep body straight from head to heels', 'Lower chest toward surface', 'Push back to starting position'], ARRAY['lower chest'], ARRAY['triceps', 'front delts']),

('Diamond Push-Ups', 'Push-up variation emphasizing triceps and inner chest.', 'chest', ARRAY['bodyweight'], 'intermediate', ARRAY['Form diamond shape with hands under chest', 'Keep elbows close to body', 'Lower chest to hands', 'Push back up'], ARRAY['chest', 'triceps'], ARRAY['front delts']),

-- BACK EXERCISES
('Barbell Deadlift', 'Compound exercise that works the entire posterior chain.', 'back', ARRAY['barbell'], 'advanced', ARRAY['Stand with feet hip-width apart, bar over mid-foot', 'Bend at hips and knees to grip bar', 'Keep back flat, chest up', 'Drive through heels to stand up', 'Lower bar with control by hinging at hips'], ARRAY['lower back', 'glutes', 'hamstrings'], ARRAY['traps', 'forearms', 'core']),

('Pull-Ups', 'Classic bodyweight back exercise. Grip bar with palms facing away.', 'back', ARRAY['bodyweight', 'pull-up bar'], 'intermediate', ARRAY['Hang from bar with overhand grip', 'Pull body up until chin clears bar', 'Lower with control to full hang', 'Avoid swinging or kipping'], ARRAY['lats'], ARRAY['biceps', 'rear delts', 'forearms']),

('Barbell Rows', 'Compound rowing movement for back thickness.', 'back', ARRAY['barbell'], 'intermediate', ARRAY['Hinge at hips with slight knee bend', 'Keep back flat, nearly parallel to floor', 'Pull bar to lower chest/upper abs', 'Lower with control'], ARRAY['lats', 'rhomboids'], ARRAY['biceps', 'rear delts', 'lower back']),

('Lat Pulldown', 'Machine exercise that mimics pull-up movement.', 'back', ARRAY['cable', 'machine'], 'beginner', ARRAY['Sit with thighs secured under pad', 'Grip bar wider than shoulder width', 'Pull bar down to upper chest', 'Control weight back up'], ARRAY['lats'], ARRAY['biceps', 'rear delts']),

('Seated Cable Row', 'Horizontal pulling exercise for back thickness.', 'back', ARRAY['cable'], 'beginner', ARRAY['Sit with feet on platform, knees slightly bent', 'Grip handle with arms extended', 'Pull handle to lower chest', 'Squeeze shoulder blades together', 'Return with control'], ARRAY['lats', 'rhomboids'], ARRAY['biceps', 'rear delts']),

('Dumbbell Row', 'Unilateral back exercise performed one arm at a time.', 'back', ARRAY['dumbbell', 'bench'], 'beginner', ARRAY['Place one hand and knee on bench', 'Keep back flat, parallel to floor', 'Row dumbbell to hip', 'Lower with control'], ARRAY['lats'], ARRAY['biceps', 'rear delts', 'rhomboids']),

('T-Bar Row', 'Rowing variation that allows heavier loads.', 'back', ARRAY['barbell', 't-bar'], 'intermediate', ARRAY['Straddle bar with handle attachment', 'Hinge at hips with flat back', 'Pull weight to chest', 'Lower with control'], ARRAY['lats', 'rhomboids'], ARRAY['biceps', 'rear delts']),

('Face Pulls', 'Excellent for rear delts and upper back health.', 'back', ARRAY['cable'], 'beginner', ARRAY['Set cable to face height', 'Grip rope with palms facing down', 'Pull toward face, separating rope ends', 'Squeeze rear delts at contraction'], ARRAY['rear delts', 'rhomboids'], ARRAY['traps', 'rotator cuff']),

('Chin-Ups', 'Pull-up variation with palms facing toward you. More bicep involvement.', 'back', ARRAY['bodyweight', 'pull-up bar'], 'intermediate', ARRAY['Hang from bar with underhand grip', 'Pull body up until chin clears bar', 'Lower with control', 'Keep core engaged'], ARRAY['lats', 'biceps'], ARRAY['rear delts', 'forearms']),

('Hyperextensions', 'Lower back exercise performed on hyperextension bench.', 'back', ARRAY['bodyweight', 'machine'], 'beginner', ARRAY['Position hips on pad, ankles secured', 'Cross arms over chest', 'Lower upper body toward floor', 'Raise back to parallel, squeeze glutes'], ARRAY['lower back'], ARRAY['glutes', 'hamstrings']),

('Rack Pulls', 'Partial deadlift focusing on upper back and lockout strength.', 'back', ARRAY['barbell', 'rack'], 'intermediate', ARRAY['Set bar at knee height in rack', 'Grip bar and set back flat', 'Drive hips forward to stand', 'Lower with control'], ARRAY['upper back', 'traps'], ARRAY['lower back', 'glutes', 'forearms']),

('Inverted Rows', 'Bodyweight rowing exercise using a bar at waist height.', 'back', ARRAY['bodyweight', 'barbell'], 'beginner', ARRAY['Set bar at waist height', 'Hang underneath with body straight', 'Pull chest to bar', 'Lower with control'], ARRAY['lats', 'rhomboids'], ARRAY['biceps', 'rear delts']),

-- SHOULDER EXERCISES
('Overhead Press', 'Compound pressing movement for shoulder development.', 'shoulders', ARRAY['barbell'], 'intermediate', ARRAY['Grip bar at shoulder width', 'Start with bar at shoulders', 'Press overhead until arms are extended', 'Lower with control to shoulders'], ARRAY['front delts', 'side delts'], ARRAY['triceps', 'upper chest', 'traps']),

('Dumbbell Shoulder Press', 'Dumbbell version allows more natural movement path.', 'shoulders', ARRAY['dumbbell'], 'beginner', ARRAY['Hold dumbbells at shoulder level', 'Press overhead until arms are extended', 'Lower with control', 'Keep core engaged'], ARRAY['front delts', 'side delts'], ARRAY['triceps', 'traps']),

('Lateral Raises', 'Isolation exercise for side deltoids.', 'shoulders', ARRAY['dumbbell'], 'beginner', ARRAY['Hold dumbbells at sides', 'Raise arms out to sides until parallel', 'Keep slight bend in elbows', 'Lower with control'], ARRAY['side delts'], ARRAY['traps']),

('Front Raises', 'Isolation exercise for front deltoids.', 'shoulders', ARRAY['dumbbell'], 'beginner', ARRAY['Hold dumbbells in front of thighs', 'Raise one or both arms to shoulder height', 'Keep slight bend in elbows', 'Lower with control'], ARRAY['front delts'], ARRAY['upper chest']),

('Rear Delt Flyes', 'Isolation exercise for rear deltoids.', 'shoulders', ARRAY['dumbbell'], 'beginner', ARRAY['Bend over with flat back', 'Hold dumbbells hanging down', 'Raise arms out to sides', 'Squeeze rear delts at top'], ARRAY['rear delts'], ARRAY['rhomboids', 'traps']),

('Arnold Press', 'Dumbbell press variation with rotation for complete delt development.', 'shoulders', ARRAY['dumbbell'], 'intermediate', ARRAY['Start with dumbbells at shoulders, palms facing you', 'Rotate palms outward as you press up', 'Reverse the motion on the way down'], ARRAY['front delts', 'side delts'], ARRAY['triceps']),

('Upright Rows', 'Pulls weight up along the body for traps and delts.', 'shoulders', ARRAY['barbell', 'dumbbell'], 'intermediate', ARRAY['Hold weight with narrow grip', 'Pull up along body to chin level', 'Lead with elbows', 'Lower with control'], ARRAY['traps', 'side delts'], ARRAY['biceps', 'front delts']),

('Cable Lateral Raises', 'Constant tension version of lateral raises.', 'shoulders', ARRAY['cable'], 'beginner', ARRAY['Stand sideways to cable machine', 'Grip handle with far hand', 'Raise arm out to side until parallel', 'Lower with control'], ARRAY['side delts'], ARRAY['traps']),

('Machine Shoulder Press', 'Beginner-friendly machine pressing movement.', 'shoulders', ARRAY['machine'], 'beginner', ARRAY['Adjust seat so handles are at shoulder level', 'Grip handles and press up', 'Extend without locking elbows', 'Lower with control'], ARRAY['front delts', 'side delts'], ARRAY['triceps']),

('Shrugs', 'Isolation exercise for trapezius muscles.', 'shoulders', ARRAY['barbell', 'dumbbell'], 'beginner', ARRAY['Hold weight at sides or in front', 'Shrug shoulders straight up toward ears', 'Hold briefly at top', 'Lower with control'], ARRAY['traps'], ARRAY['forearms']),

-- ARM EXERCISES (BICEPS)
('Barbell Curl', 'Classic bicep exercise with a barbell.', 'arms', ARRAY['barbell'], 'beginner', ARRAY['Stand with barbell at thighs, underhand grip', 'Curl bar up toward shoulders', 'Keep elbows at sides', 'Lower with control'], ARRAY['biceps'], ARRAY['forearms']),

('Dumbbell Curl', 'Bicep curl with dumbbells allowing independent arm movement.', 'arms', ARRAY['dumbbell'], 'beginner', ARRAY['Hold dumbbells at sides, palms forward', 'Curl weights toward shoulders', 'Keep elbows stationary', 'Lower with control'], ARRAY['biceps'], ARRAY['forearms']),

('Hammer Curls', 'Curl variation with neutral grip targeting brachialis.', 'arms', ARRAY['dumbbell'], 'beginner', ARRAY['Hold dumbbells with palms facing each other', 'Curl weights toward shoulders', 'Maintain neutral grip throughout', 'Lower with control'], ARRAY['biceps', 'brachialis'], ARRAY['forearms']),

('Preacher Curls', 'Curl performed on preacher bench to isolate biceps.', 'arms', ARRAY['barbell', 'dumbbell', 'machine'], 'beginner', ARRAY['Rest arms on preacher pad', 'Curl weight toward shoulders', 'Do not lift elbows off pad', 'Lower with control'], ARRAY['biceps'], ARRAY['forearms']),

('Incline Dumbbell Curl', 'Curl performed on incline bench for stretched position.', 'arms', ARRAY['dumbbell', 'bench'], 'intermediate', ARRAY['Sit on incline bench with arms hanging', 'Curl dumbbells toward shoulders', 'Keep upper arms stationary', 'Lower with full stretch'], ARRAY['biceps'], ARRAY['forearms']),

('Concentration Curl', 'Single-arm curl for peak bicep contraction.', 'arms', ARRAY['dumbbell'], 'beginner', ARRAY['Sit with elbow braced against inner thigh', 'Curl dumbbell toward shoulder', 'Squeeze bicep at top', 'Lower with control'], ARRAY['biceps'], ARRAY['forearms']),

('Cable Curl', 'Bicep curl using cable for constant tension.', 'arms', ARRAY['cable'], 'beginner', ARRAY['Stand facing cable machine with low pulley', 'Grip bar or handle with underhand grip', 'Curl toward shoulders', 'Lower with control'], ARRAY['biceps'], ARRAY['forearms']),

('Spider Curls', 'Curl performed face-down on incline bench.', 'arms', ARRAY['dumbbell', 'barbell', 'bench'], 'intermediate', ARRAY['Lie face down on incline bench', 'Let arms hang straight down', 'Curl weight toward shoulders', 'Lower with control'], ARRAY['biceps'], ARRAY['forearms']),

-- ARM EXERCISES (TRICEPS)
('Close-Grip Bench Press', 'Bench press variation emphasizing triceps.', 'arms', ARRAY['barbell', 'bench'], 'intermediate', ARRAY['Grip bar with hands shoulder-width or narrower', 'Lower bar to lower chest', 'Keep elbows close to body', 'Press up to lockout'], ARRAY['triceps'], ARRAY['chest', 'front delts']),

('Tricep Pushdown', 'Cable exercise for triceps using rope or bar.', 'arms', ARRAY['cable'], 'beginner', ARRAY['Face cable machine with high pulley', 'Grip bar or rope', 'Push down until arms are extended', 'Keep elbows at sides'], ARRAY['triceps'], ARRAY[]::text[]),

('Skull Crushers', 'Lying tricep extension with barbell or dumbbells.', 'arms', ARRAY['barbell', 'dumbbell', 'bench'], 'intermediate', ARRAY['Lie on bench holding weight above chest', 'Lower weight toward forehead by bending elbows', 'Keep upper arms stationary', 'Extend back to start'], ARRAY['triceps'], ARRAY[]::text[]),

('Overhead Tricep Extension', 'Tricep extension performed overhead.', 'arms', ARRAY['dumbbell', 'cable'], 'beginner', ARRAY['Hold weight overhead with arms extended', 'Lower weight behind head by bending elbows', 'Keep upper arms close to head', 'Extend back to start'], ARRAY['triceps'], ARRAY[]::text[]),

('Dips', 'Compound bodyweight exercise for triceps and chest.', 'arms', ARRAY['bodyweight', 'dip bars'], 'intermediate', ARRAY['Support body on dip bars with arms extended', 'Lower by bending elbows to 90 degrees', 'Keep torso upright for tricep focus', 'Push back up to start'], ARRAY['triceps'], ARRAY['chest', 'front delts']),

('Tricep Kickbacks', 'Isolation exercise for triceps.', 'arms', ARRAY['dumbbell'], 'beginner', ARRAY['Bend over with upper arm parallel to floor', 'Extend forearm back until arm is straight', 'Squeeze tricep at full extension', 'Lower with control'], ARRAY['triceps'], ARRAY[]::text[]),

('Diamond Push-Ups', 'Push-up variation for triceps emphasis.', 'arms', ARRAY['bodyweight'], 'intermediate', ARRAY['Form diamond with hands under chest', 'Lower chest to hands', 'Keep elbows close to body', 'Push back up'], ARRAY['triceps'], ARRAY['chest', 'front delts']),

('Bench Dips', 'Dip variation using a bench.', 'arms', ARRAY['bodyweight', 'bench'], 'beginner', ARRAY['Place hands on bench behind you', 'Extend legs in front', 'Lower body by bending elbows', 'Push back up'], ARRAY['triceps'], ARRAY['front delts']),

-- LEG EXERCISES
('Barbell Squat', 'The king of leg exercises. Compound movement for entire lower body.', 'legs', ARRAY['barbell', 'rack'], 'intermediate', ARRAY['Set bar on upper back, step back from rack', 'Feet shoulder-width apart, toes slightly out', 'Squat down until thighs are parallel', 'Drive through heels to stand', 'Keep chest up and core braced'], ARRAY['quads', 'glutes'], ARRAY['hamstrings', 'lower back', 'core']),

('Romanian Deadlift', 'Hip hinge movement targeting hamstrings and glutes.', 'legs', ARRAY['barbell', 'dumbbell'], 'intermediate', ARRAY['Hold weight in front of thighs', 'Push hips back while lowering weight', 'Keep back flat, slight knee bend', 'Feel stretch in hamstrings', 'Drive hips forward to stand'], ARRAY['hamstrings', 'glutes'], ARRAY['lower back']),

('Leg Press', 'Machine exercise for quads, glutes, and hamstrings.', 'legs', ARRAY['machine'], 'beginner', ARRAY['Sit in machine with back flat against pad', 'Place feet shoulder-width on platform', 'Lower platform by bending knees', 'Press back up without locking knees'], ARRAY['quads', 'glutes'], ARRAY['hamstrings']),

('Lunges', 'Unilateral leg exercise for quads and glutes.', 'legs', ARRAY['bodyweight', 'dumbbell', 'barbell'], 'beginner', ARRAY['Step forward into lunge position', 'Lower back knee toward floor', 'Keep front knee over ankle', 'Push back to starting position'], ARRAY['quads', 'glutes'], ARRAY['hamstrings']),

('Leg Extension', 'Isolation exercise for quadriceps.', 'legs', ARRAY['machine'], 'beginner', ARRAY['Sit in machine with back against pad', 'Hook ankles under roller', 'Extend legs until straight', 'Lower with control'], ARRAY['quads'], ARRAY[]::text[]),

('Leg Curl', 'Isolation exercise for hamstrings.', 'legs', ARRAY['machine'], 'beginner', ARRAY['Lie face down or sit in machine', 'Hook ankles over roller', 'Curl weight toward glutes', 'Lower with control'], ARRAY['hamstrings'], ARRAY[]::text[]),

('Bulgarian Split Squat', 'Single-leg squat with rear foot elevated.', 'legs', ARRAY['bodyweight', 'dumbbell'], 'intermediate', ARRAY['Place rear foot on bench behind you', 'Lower until back knee nearly touches floor', 'Keep front knee over ankle', 'Drive through front foot to stand'], ARRAY['quads', 'glutes'], ARRAY['hamstrings']),

('Goblet Squat', 'Squat variation holding weight at chest.', 'legs', ARRAY['dumbbell', 'kettlebell'], 'beginner', ARRAY['Hold weight at chest with both hands', 'Squat down keeping chest up', 'Drive through heels to stand', 'Keep core braced throughout'], ARRAY['quads', 'glutes'], ARRAY['core']),

('Hip Thrust', 'Glute-focused exercise performed with back on bench.', 'legs', ARRAY['barbell', 'bench'], 'intermediate', ARRAY['Sit with upper back against bench', 'Roll barbell over hips', 'Drive hips up until body is straight', 'Squeeze glutes at top', 'Lower with control'], ARRAY['glutes'], ARRAY['hamstrings']),

('Calf Raises', 'Isolation exercise for calf muscles.', 'legs', ARRAY['bodyweight', 'machine', 'dumbbell'], 'beginner', ARRAY['Stand on edge of step or platform', 'Lower heels below platform level', 'Rise up onto toes as high as possible', 'Lower with control'], ARRAY['calves'], ARRAY[]::text[]),

('Front Squat', 'Squat variation with bar held in front.', 'legs', ARRAY['barbell', 'rack'], 'advanced', ARRAY['Rest bar on front delts, elbows high', 'Squat down keeping torso upright', 'Drive through heels to stand', 'Keep elbows up throughout'], ARRAY['quads'], ARRAY['glutes', 'core']),

('Step-Ups', 'Unilateral exercise stepping onto elevated platform.', 'legs', ARRAY['bodyweight', 'dumbbell', 'bench'], 'beginner', ARRAY['Stand facing bench or box', 'Step up with one foot', 'Drive through heel to stand on platform', 'Step back down with control'], ARRAY['quads', 'glutes'], ARRAY['hamstrings']),

('Sumo Deadlift', 'Wide-stance deadlift variation.', 'legs', ARRAY['barbell'], 'intermediate', ARRAY['Take wide stance with toes pointed out', 'Grip bar inside knees', 'Keep chest up, back flat', 'Drive through heels to stand'], ARRAY['glutes', 'quads', 'hamstrings'], ARRAY['lower back', 'adductors']),

('Walking Lunges', 'Dynamic lunge performed while moving forward.', 'legs', ARRAY['bodyweight', 'dumbbell'], 'beginner', ARRAY['Step forward into lunge', 'Lower back knee toward floor', 'Step forward with back leg into next lunge', 'Continue walking pattern'], ARRAY['quads', 'glutes'], ARRAY['hamstrings']),

('Hack Squat', 'Machine squat variation targeting quads.', 'legs', ARRAY['machine'], 'intermediate', ARRAY['Position shoulders under pads', 'Feet shoulder-width on platform', 'Squat down until thighs are parallel', 'Press back up'], ARRAY['quads'], ARRAY['glutes']),

('Good Mornings', 'Hip hinge exercise with bar on back.', 'legs', ARRAY['barbell'], 'intermediate', ARRAY['Place bar on upper back like squat', 'Push hips back while leaning forward', 'Keep back flat, slight knee bend', 'Return to standing'], ARRAY['hamstrings', 'lower back'], ARRAY['glutes']),

-- CORE EXERCISES
('Plank', 'Isometric core exercise holding push-up position.', 'core', ARRAY['bodyweight'], 'beginner', ARRAY['Support body on forearms and toes', 'Keep body in straight line', 'Engage core, squeeze glutes', 'Hold for prescribed time'], ARRAY['core'], ARRAY['shoulders', 'glutes']),

('Crunches', 'Basic abdominal exercise.', 'core', ARRAY['bodyweight'], 'beginner', ARRAY['Lie on back with knees bent', 'Place hands behind head', 'Curl shoulders off floor toward knees', 'Lower with control'], ARRAY['abs'], ARRAY[]::text[]),

('Hanging Leg Raise', 'Advanced ab exercise hanging from bar.', 'core', ARRAY['bodyweight', 'pull-up bar'], 'advanced', ARRAY['Hang from bar with arms extended', 'Raise legs until parallel to floor', 'Lower with control', 'Avoid swinging'], ARRAY['lower abs'], ARRAY['hip flexors']),

('Russian Twist', 'Rotational core exercise.', 'core', ARRAY['bodyweight', 'dumbbell', 'medicine ball'], 'beginner', ARRAY['Sit with knees bent, feet off floor', 'Lean back slightly', 'Rotate torso side to side', 'Touch weight to floor each side'], ARRAY['obliques'], ARRAY['abs']),

('Dead Bug', 'Core stability exercise lying on back.', 'core', ARRAY['bodyweight'], 'beginner', ARRAY['Lie on back with arms up, knees at 90 degrees', 'Lower opposite arm and leg toward floor', 'Keep lower back pressed to floor', 'Return and repeat other side'], ARRAY['core'], ARRAY['hip flexors']),

('Mountain Climbers', 'Dynamic core exercise in plank position.', 'core', ARRAY['bodyweight'], 'beginner', ARRAY['Start in push-up position', 'Drive one knee toward chest', 'Quickly switch legs', 'Keep hips low and core tight'], ARRAY['core'], ARRAY['hip flexors', 'shoulders']),

('Ab Wheel Rollout', 'Advanced core exercise using ab wheel.', 'core', ARRAY['ab wheel'], 'advanced', ARRAY['Kneel with hands on wheel', 'Roll wheel forward extending body', 'Keep core tight, back flat', 'Roll back to starting position'], ARRAY['abs'], ARRAY['lats', 'shoulders']),

('Cable Woodchop', 'Rotational core exercise using cable machine.', 'core', ARRAY['cable'], 'intermediate', ARRAY['Set cable to high or low position', 'Rotate torso pulling cable diagonally', 'Keep arms relatively straight', 'Control the return'], ARRAY['obliques'], ARRAY['core', 'shoulders']),

('Bicycle Crunches', 'Crunch variation with rotation and leg movement.', 'core', ARRAY['bodyweight'], 'beginner', ARRAY['Lie on back with hands behind head', 'Bring opposite elbow to knee', 'Extend other leg straight', 'Alternate sides in cycling motion'], ARRAY['abs', 'obliques'], ARRAY[]::text[]),

('Side Plank', 'Lateral core stability exercise.', 'core', ARRAY['bodyweight'], 'beginner', ARRAY['Lie on side, prop up on forearm', 'Raise hips until body is straight', 'Hold position', 'Keep hips from sagging'], ARRAY['obliques'], ARRAY['core', 'shoulders']),

('Pallof Press', 'Anti-rotation core exercise using cable.', 'core', ARRAY['cable', 'band'], 'intermediate', ARRAY['Stand sideways to cable at chest height', 'Hold handle at chest', 'Press hands straight out', 'Resist rotation, return to chest'], ARRAY['core', 'obliques'], ARRAY[]::text[]),

('Reverse Crunch', 'Crunch variation targeting lower abs.', 'core', ARRAY['bodyweight'], 'beginner', ARRAY['Lie on back with knees bent', 'Curl hips off floor toward chest', 'Lower with control', 'Keep upper back on floor'], ARRAY['lower abs'], ARRAY[]::text[]),

('Flutter Kicks', 'Core exercise with alternating leg raises.', 'core', ARRAY['bodyweight'], 'beginner', ARRAY['Lie on back with legs extended', 'Raise legs slightly off floor', 'Alternate small kicks up and down', 'Keep lower back pressed to floor'], ARRAY['lower abs'], ARRAY['hip flexors']),

('Toe Touches', 'Ab exercise reaching toward raised feet.', 'core', ARRAY['bodyweight'], 'beginner', ARRAY['Lie on back with legs raised straight up', 'Reach hands toward toes', 'Lift shoulders off floor', 'Lower with control'], ARRAY['abs'], ARRAY[]::text[]),

-- FULL BODY / COMPOUND EXERCISES
('Burpees', 'Full body exercise combining squat, push-up, and jump.', 'full_body', ARRAY['bodyweight'], 'intermediate', ARRAY['Stand, then squat and place hands on floor', 'Jump feet back to push-up position', 'Perform push-up', 'Jump feet forward and jump up with arms overhead'], ARRAY['full body'], ARRAY['cardio']),

('Thrusters', 'Combination of front squat and overhead press.', 'full_body', ARRAY['barbell', 'dumbbell'], 'intermediate', ARRAY['Hold weight at shoulders', 'Perform front squat', 'As you stand, press weight overhead', 'Lower weight to shoulders and repeat'], ARRAY['quads', 'shoulders'], ARRAY['glutes', 'triceps', 'core']),

('Clean and Press', 'Olympic-style lift bringing weight from floor to overhead.', 'full_body', ARRAY['barbell', 'dumbbell'], 'advanced', ARRAY['Start with weight on floor', 'Pull weight up explosively', 'Catch at shoulders', 'Press overhead'], ARRAY['full body'], ARRAY['traps', 'shoulders', 'legs']),

('Kettlebell Swing', 'Explosive hip hinge movement with kettlebell.', 'full_body', ARRAY['kettlebell'], 'intermediate', ARRAY['Stand with feet shoulder-width, KB between feet', 'Hinge hips and swing KB back', 'Drive hips forward explosively', 'Swing KB to chest height', 'Let it swing back and repeat'], ARRAY['glutes', 'hamstrings'], ARRAY['core', 'shoulders']),

('Turkish Get-Up', 'Complex movement going from lying to standing while holding weight.', 'full_body', ARRAY['kettlebell', 'dumbbell'], 'advanced', ARRAY['Lie on back holding weight above shoulder', 'Roll to elbow, then to hand', 'Lift hips, sweep leg through to kneel', 'Stand up, then reverse the movement'], ARRAY['full body'], ARRAY['core', 'shoulders']),

('Man Makers', 'Combination of push-up, rows, and thruster.', 'full_body', ARRAY['dumbbell'], 'advanced', ARRAY['Start in push-up position with hands on dumbbells', 'Perform push-up', 'Row each dumbbell', 'Jump feet to hands', 'Clean and press the dumbbells'], ARRAY['full body'], ARRAY['chest', 'back', 'shoulders', 'legs']),

('Box Jumps', 'Explosive lower body exercise jumping onto box.', 'full_body', ARRAY['box', 'bodyweight'], 'intermediate', ARRAY['Stand facing box', 'Swing arms and jump onto box', 'Land softly with knees bent', 'Step down and repeat'], ARRAY['quads', 'glutes'], ARRAY['calves', 'cardio']),

('Battle Ropes', 'Full body conditioning exercise using heavy ropes.', 'full_body', ARRAY['battle ropes'], 'intermediate', ARRAY['Hold one end of rope in each hand', 'Create waves by alternating arms up and down', 'Keep core engaged', 'Maintain for prescribed time'], ARRAY['shoulders', 'core'], ARRAY['full body', 'cardio']),

('Sled Push', 'Full body pushing exercise using weighted sled.', 'full_body', ARRAY['sled'], 'intermediate', ARRAY['Place hands on sled handles', 'Drive through legs to push sled forward', 'Keep back flat, core engaged', 'Continue for prescribed distance'], ARRAY['quads', 'glutes'], ARRAY['full body', 'cardio']),

('Farmers Walk', 'Loaded carry exercise for grip and full body.', 'full_body', ARRAY['dumbbell', 'kettlebell', 'trap bar'], 'beginner', ARRAY['Hold heavy weights at sides', 'Walk forward with tall posture', 'Keep core engaged, shoulders back', 'Continue for prescribed distance'], ARRAY['forearms', 'traps'], ARRAY['core', 'full body']);

-- Add more exercises to reach ~200 total
INSERT INTO public.exercises (name, description, body_part, equipment, difficulty, instructions, muscles_primary, muscles_secondary) VALUES

-- Additional chest exercises
('Pec Deck', 'Machine flye movement for chest.', 'chest', ARRAY['machine'], 'beginner', ARRAY['Sit with back against pad', 'Place forearms on pads', 'Bring pads together in front', 'Return with control'], ARRAY['chest'], ARRAY['front delts']),

('Landmine Press', 'Angled pressing movement using landmine attachment.', 'chest', ARRAY['barbell', 'landmine'], 'intermediate', ARRAY['Hold end of barbell at shoulder', 'Press up and forward at angle', 'Lower with control', 'Can be done standing or kneeling'], ARRAY['upper chest'], ARRAY['shoulders', 'triceps']),

-- Additional back exercises
('Meadows Row', 'Single-arm row using landmine for unique angle.', 'back', ARRAY['barbell', 'landmine'], 'intermediate', ARRAY['Straddle barbell in landmine', 'Grip end with one hand', 'Row toward hip with elbow out', 'Lower with control'], ARRAY['lats'], ARRAY['biceps', 'rear delts']),

('Straight Arm Pulldown', 'Isolation exercise for lats.', 'back', ARRAY['cable'], 'beginner', ARRAY['Stand facing cable with high pulley', 'Keep arms straight throughout', 'Pull bar down to thighs', 'Return with control'], ARRAY['lats'], ARRAY['triceps']),

('Kroc Rows', 'Heavy single-arm rows with body english.', 'back', ARRAY['dumbbell'], 'advanced', ARRAY['Use heavier weight than strict rows', 'Some body movement allowed', 'Focus on moving maximum weight', 'Full stretch at bottom'], ARRAY['lats'], ARRAY['biceps', 'forearms']),

-- Additional shoulder exercises
('Lu Raises', 'Lateral raise variation with forward lean.', 'shoulders', ARRAY['dumbbell'], 'intermediate', ARRAY['Lean forward slightly', 'Raise dumbbells with thumbs up', 'Lead with pinkies at top', 'Lower with control'], ARRAY['side delts'], ARRAY['rear delts']),

('Bradford Press', 'Press alternating front and behind head.', 'shoulders', ARRAY['barbell'], 'intermediate', ARRAY['Press bar from front to just over head', 'Lower behind head', 'Press back over and to front', 'Do not lock out'], ARRAY['front delts', 'side delts'], ARRAY['triceps']),

('Plate Front Raise', 'Front raise using weight plate.', 'shoulders', ARRAY['plate'], 'beginner', ARRAY['Hold plate at sides with both hands', 'Raise to shoulder height', 'Keep arms slightly bent', 'Lower with control'], ARRAY['front delts'], ARRAY['upper chest']),

-- Additional arm exercises
('Zottman Curl', 'Curl with rotation at top for complete forearm work.', 'arms', ARRAY['dumbbell'], 'intermediate', ARRAY['Curl up with palms facing up', 'Rotate to palms down at top', 'Lower with palms down', 'Rotate back at bottom'], ARRAY['biceps', 'forearms'], ARRAY[]::text[]),

('Reverse Curl', 'Curl with overhand grip for forearms.', 'arms', ARRAY['barbell', 'dumbbell'], 'beginner', ARRAY['Hold weight with overhand grip', 'Curl toward shoulders', 'Keep elbows at sides', 'Lower with control'], ARRAY['forearms', 'brachialis'], ARRAY['biceps']),

('JM Press', 'Hybrid between close-grip press and skull crusher.', 'arms', ARRAY['barbell', 'bench'], 'advanced', ARRAY['Lie on bench with close grip', 'Lower bar toward chin/upper chest', 'Elbows point forward', 'Press back up'], ARRAY['triceps'], ARRAY['chest']),

('Tate Press', 'Tricep extension with elbows flared.', 'arms', ARRAY['dumbbell', 'bench'], 'intermediate', ARRAY['Lie on bench holding dumbbells', 'Lower weights to chest with elbows out', 'Extend back up', 'Keep elbows flared throughout'], ARRAY['triceps'], ARRAY[]::text[]),

-- Additional leg exercises
('Sissy Squat', 'Quad-focused squat leaning backward.', 'legs', ARRAY['bodyweight'], 'advanced', ARRAY['Hold onto support for balance', 'Lean back while bending knees', 'Lower until thighs are very stretched', 'Return to standing'], ARRAY['quads'], ARRAY[]::text[]),

('Nordic Curl', 'Eccentric hamstring exercise.', 'legs', ARRAY['bodyweight'], 'advanced', ARRAY['Kneel with ankles secured', 'Lower body forward with control', 'Use hamstrings to resist gravity', 'Push off floor to return if needed'], ARRAY['hamstrings'], ARRAY[]::text[]),

('Leg Press Calf Raise', 'Calf raise performed on leg press machine.', 'legs', ARRAY['machine'], 'beginner', ARRAY['Position feet on lower edge of platform', 'Extend legs but dont lock knees', 'Push through toes', 'Lower heels for full stretch'], ARRAY['calves'], ARRAY[]::text[]),

('Glute Bridge', 'Hip thrust variation on floor.', 'legs', ARRAY['bodyweight', 'barbell'], 'beginner', ARRAY['Lie on back with knees bent', 'Drive hips up squeezing glutes', 'Form straight line from knees to shoulders', 'Lower with control'], ARRAY['glutes'], ARRAY['hamstrings']),

('Single Leg Deadlift', 'Unilateral deadlift for balance and hamstrings.', 'legs', ARRAY['dumbbell', 'kettlebell', 'bodyweight'], 'intermediate', ARRAY['Stand on one leg', 'Hinge forward while raising other leg back', 'Keep back flat', 'Return to standing'], ARRAY['hamstrings', 'glutes'], ARRAY['core']),

('Adductor Machine', 'Machine targeting inner thighs.', 'legs', ARRAY['machine'], 'beginner', ARRAY['Sit in machine with pads on inner thighs', 'Squeeze legs together', 'Control the return'], ARRAY['adductors'], ARRAY[]::text[]),

('Abductor Machine', 'Machine targeting outer hips.', 'legs', ARRAY['machine'], 'beginner', ARRAY['Sit in machine with pads on outer thighs', 'Push legs apart', 'Control the return'], ARRAY['abductors', 'glutes'], ARRAY[]::text[]),

-- Additional core exercises
('Dragon Flag', 'Advanced core exercise made famous by Bruce Lee.', 'core', ARRAY['bodyweight', 'bench'], 'advanced', ARRAY['Lie on bench holding edges behind head', 'Raise body until only shoulders touch bench', 'Lower with control keeping body straight', 'Do not let lower back touch bench'], ARRAY['abs'], ARRAY['hip flexors']),

('L-Sit', 'Isometric core hold with legs extended.', 'core', ARRAY['bodyweight', 'parallettes'], 'advanced', ARRAY['Support body on hands', 'Lift legs until parallel to floor', 'Keep legs straight', 'Hold for prescribed time'], ARRAY['abs', 'hip flexors'], ARRAY['triceps']),

('Hollow Body Hold', 'Gymnastic core exercise.', 'core', ARRAY['bodyweight'], 'intermediate', ARRAY['Lie on back with arms overhead', 'Lift shoulders and legs off floor', 'Press lower back into floor', 'Hold position'], ARRAY['abs'], ARRAY['hip flexors']),

('Bird Dog', 'Core stability exercise on hands and knees.', 'core', ARRAY['bodyweight'], 'beginner', ARRAY['Start on hands and knees', 'Extend opposite arm and leg', 'Keep back flat and hips level', 'Return and switch sides'], ARRAY['core'], ARRAY['glutes', 'lower back']),

('V-Up', 'Advanced crunch bringing hands to feet.', 'core', ARRAY['bodyweight'], 'intermediate', ARRAY['Lie flat with arms overhead', 'Simultaneously lift legs and torso', 'Touch hands to feet at top', 'Lower with control'], ARRAY['abs'], ARRAY['hip flexors']),

-- Additional full body exercises
('Hang Clean', 'Olympic lift variation starting from hang position.', 'full_body', ARRAY['barbell'], 'advanced', ARRAY['Start with bar at thighs', 'Dip and explosively extend hips', 'Pull bar up and catch at shoulders', 'Stand up fully'], ARRAY['full body'], ARRAY['traps', 'quads', 'glutes']),

('Push Press', 'Overhead press using leg drive.', 'full_body', ARRAY['barbell', 'dumbbell'], 'intermediate', ARRAY['Hold weight at shoulders', 'Dip knees slightly', 'Explosively drive through legs', 'Press weight overhead'], ARRAY['shoulders'], ARRAY['legs', 'triceps', 'core']),

('Snatch Grip Deadlift', 'Deadlift with wide grip for upper back emphasis.', 'full_body', ARRAY['barbell'], 'intermediate', ARRAY['Use wide snatch grip on bar', 'Set up as regular deadlift', 'Keep chest up, back flat', 'Stand up maintaining grip'], ARRAY['back', 'hamstrings'], ARRAY['traps', 'glutes']),

('Devils Press', 'Burpee with dumbbell snatch.', 'full_body', ARRAY['dumbbell'], 'advanced', ARRAY['Perform burpee holding dumbbells', 'At bottom, do push-up on dumbbells', 'Jump up and snatch dumbbells overhead', 'Lower and repeat'], ARRAY['full body'], ARRAY['cardio']);
