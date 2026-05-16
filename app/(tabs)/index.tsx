import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { exerciseMedia } from '../../src/data/exerciseMedia';

type Language = 'bg' | 'en';
type Mode = 'questions' | 'analyzing' | 'dashboard' | 'exerciseDetail';

type Exercise = {
  bg: string;
  en: string;
  descriptionBg: string;
  descriptionEn: string;
  mistakeBg: string;
  mistakeEn: string;
  image: string;
  category: string;
  equipment: 'home' | 'gym' | 'both';
  avoid?: string[];
};

type PlanExercise = {
  name: string;
  sets: string;
  description: string;
  mistake: string;
  image: string;
  imageUrl?: any;
};

type WorkoutDay = {
  day: string;
  focus: string;
  exercises: PlanExercise[];
};

export default function HomeScreen() {
  const [language, setLanguage] = useState<Language>('bg');
  const [mode, setMode] = useState<Mode>('questions');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState<PlanExercise | null>(null);

  const t = language === 'bg' ? bg : en;
  const current = t.questions[step];
  const progress = ((step + 1) / t.questions.length) * 100;

  const workoutPlan = useMemo(
    () => generateWorkoutPlan(answers, language),
    [answers, language]
  );

  useEffect(() => {
    if (mode !== 'analyzing') return;

    setAnalysisProgress(0);

    const interval = setInterval(() => {
      setAnalysisProgress((value) => {
        if (value >= 100) {
          clearInterval(interval);
          setTimeout(() => setMode('dashboard'), 500);
          return 100;
        }

        return value + 10;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [mode]);

  const toggleLanguage = () => {
    setLanguage(language === 'bg' ? 'en' : 'bg');
  };

  const goBack = () => {
    if (mode === 'exerciseDetail') {
      setMode('dashboard');
      return;
    }

    if (mode !== 'questions') {
      setMode('questions');
      return;
    }

    if (step > 0) setStep(step - 1);
  };

  const goNext = () => {
    if (step < t.questions.length - 1) {
      setStep(step + 1);
    } else {
      setMode('analyzing');
    }
  };

  const chooseAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [current.key]: value,
    }));

    setTimeout(goNext, 250);
  };

  if (mode === 'exerciseDetail' && selectedExercise) {
    return (
      <ScrollView contentContainerStyle={styles.detailContainer}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← {t.back}</Text>
        </TouchableOpacity>

        <View style={styles.detailImageBox}>
          {selectedExercise.imageUrl ? (
            <Image
              source={selectedExercise.imageUrl}
              style={styles.detailPhoto}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.detailImage}>{selectedExercise.image}</Text>
          )}
        </View>

        <Text style={styles.detailTitle}>{selectedExercise.name}</Text>
        <Text style={styles.detailSets}>{selectedExercise.sets}</Text>

        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>{t.howToDo}</Text>
          <Text style={styles.detailText}>{selectedExercise.description}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>{t.commonMistake}</Text>
          <Text style={styles.detailText}>{selectedExercise.mistake}</Text>
        </View>

        <TouchableOpacity style={styles.restartButton} onPress={goBack}>
          <Text style={styles.restartButtonText}>{t.backToPlan}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (mode === 'analyzing') {
    return (
      <View style={styles.screen}>
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisEmoji}>🤖</Text>
          <Text style={styles.analysisTitle}>{t.analyzingTitle}</Text>
          <Text style={styles.analysisText}>{t.analyzingText}</Text>

          <View style={styles.analysisBarBackground}>
            <View style={[styles.analysisBarFill, { width: `${analysisProgress}%` }]} />
          </View>

          <Text style={styles.analysisPercent}>{analysisProgress}%</Text>
        </View>
      </View>
    );
  }

  if (mode === 'dashboard') {
    return (
      <ScrollView contentContainerStyle={styles.dashboardContainer}>
        <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
          <Text style={styles.languageText}>
            {language === 'bg' ? '🇬🇧 EN' : '🇧🇬 BG'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.dashboardTitle}>{t.dashboardTitle}</Text>
        <Text style={styles.dashboardSubtitle}>{t.dashboardSubtitle}</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t.trainingPlan}</Text>
          <Text style={styles.cardValue}>
            {workoutPlan.length} {t.daysPerWeek}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t.mainGoal}</Text>
          <Text style={styles.cardValue}>{answers.goal || '-'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t.trainingPlace}</Text>
          <Text style={styles.cardValue}>{answers.place || '-'}</Text>
        </View>

        <Text style={styles.workoutTitle}>{t.workoutPlanTitle}</Text>
        <Text style={styles.tapHint}>{t.tapExercise}</Text>

        {workoutPlan.map((day, index) => (
          <View key={index} style={styles.workoutCard}>
            <Text style={styles.workoutDay}>{day.day}</Text>
            <Text style={styles.workoutFocus}>{day.focus}</Text>

            {day.exercises.map((exercise, exerciseIndex) => (
              <TouchableOpacity
                key={exerciseIndex}
                style={styles.exerciseRow}
                onPress={() => {
                  setSelectedExercise(exercise);
                  setMode('exerciseDetail');
                }}
              >
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseSets}>{exercise.sets}</Text>
                <Text style={styles.exerciseOpen}>{t.openExercise}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity
          style={styles.restartButton}
          onPress={() => {
            setMode('questions');
            setStep(0);
            setAnswers({});
          }}
        >
          <Text style={styles.restartButtonText}>{t.restart}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.smallButton} onPress={goBack}>
            <Text style={styles.smallButtonText}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
            <Text style={styles.languageText}>
              {language === 'bg' ? '🇬🇧 EN' : '🇧🇬 BG'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.stepText}>
          {step + 1} / {t.questions.length}
        </Text>

        <Text style={styles.logo}>My Fitness Coach</Text>

        <View style={styles.imageBox}>
          <Text style={styles.imageEmoji}>{current.emoji}</Text>
        </View>

        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.subtitle}>{current.description}</Text>

        {current.type === 'input' ? (
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder={current.placeholder}
              placeholderTextColor="#888"
              keyboardType={current.keyboard || 'default'}
              value={answers[current.key] || ''}
              onChangeText={(text) =>
                setAnswers((prev) => ({
                  ...prev,
                  [current.key]: text,
                }))
              }
            />

            <TouchableOpacity style={styles.button} onPress={goNext}>
              <Text style={styles.buttonText}>{t.continue}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.optionsArea}>
            {current.options?.map((option: string) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  answers[current.key] === option && styles.selectedOption,
                ]}
                onPress={() => chooseAnswer(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
                <Text style={styles.circle}>
                  {answers[current.key] === option ? '●' : '○'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const bg = {
  continue: 'Продължи',
  back: 'Назад',
  backToPlan: 'Назад към програмата',
  howToDo: 'Как се изпълнява',
  commonMistake: 'Честа грешка',
  tapExercise: 'Натисни упражнение, за да видиш обяснение и изображение.',
  openExercise: 'Натисни за обяснение и изображение',
  analyzingTitle: 'Анализираме твоя профил...',
  analyzingText: 'Създаваме индивидуална програма според твоите отговори.',
  dashboardTitle: 'Твоят персонален план',
  dashboardSubtitle: 'Програмата е създадена според цел, опит, място и ограничения.',
  trainingPlan: 'Тренировъчен план',
  mainGoal: 'Основна цел',
  trainingPlace: 'Място за тренировка',
  daysPerWeek: 'дни седмично',
  workoutPlanTitle: 'Твоята индивидуална програма',
  restart: 'Започни отначало',
  questions: [
    { key: 'name', type: 'input', emoji: '👋', title: 'Как се казваш?', description: 'Ще използваме името ти, за да персонализираме плана.', placeholder: 'Твоето име' },
    { key: 'gender', type: 'choice', emoji: '🧍', title: 'Какъв е твоят пол?', description: 'Това помага за по-точен фитнес профил.', options: ['Мъж', 'Жена', 'Предпочитам да не казвам'] },
    { key: 'age', type: 'choice', emoji: '🎂', title: 'В коя възрастова група си?', description: 'Възрастта помага да настроим натоварването.', options: ['18–29', '30–39', '40–49', '50+'] },
    { key: 'height', type: 'input', emoji: '📏', title: 'Какъв е твоят ръст?', description: 'Въведи ръста си в сантиметри.', placeholder: 'Ръст в см', keyboard: 'numeric' },
    { key: 'weight', type: 'input', emoji: '⚖️', title: 'Какво е сегашното ти тегло?', description: 'Въведи теглото си в килограми.', placeholder: 'Тегло в кг', keyboard: 'numeric' },
    { key: 'goal', type: 'choice', emoji: '🎯', title: 'Каква е основната ти цел?', description: 'Това определя стила на програмата.', options: ['Сваляне на килограми', 'Качване на мускулна маса', 'Горене на мазнини и мускули', 'Поддържане на форма'] },
    { key: 'targetWeight', type: 'input', emoji: '🏁', title: 'Какво е желаното ти тегло?', description: 'Това помага за реалистичен прогрес.', placeholder: 'Желано тегло в кг', keyboard: 'numeric' },
    { key: 'place', type: 'choice', emoji: '🏋️', title: 'Къде ще тренираш?', description: 'Избираме упражнения според оборудването.', options: ['У дома', 'Във фитнес', 'У дома и във фитнес'] },
    { key: 'experience', type: 'choice', emoji: '💪', title: 'Какъв опит имаш?', description: 'Опитът определя трудността.', options: ['Начинаещ', 'Средно ниво', 'Напреднал'] },
    { key: 'days', type: 'choice', emoji: '📅', title: 'Колко дни седмично можеш да тренираш?', description: 'Избери реалистично.', options: ['2 дни', '3 дни', '4 дни', '5 дни', '6 дни'] },
    { key: 'activity', type: 'choice', emoji: '🔥', title: 'Колко активен си през деня?', description: 'Това помага за натоварването.', options: ['Предимно седя', 'Леко активен', 'Активна работа', 'Много активен'] },
    { key: 'sleep', type: 'choice', emoji: '😴', title: 'Колко часа спиш?', description: 'Сънят влияе на възстановяването.', options: ['Под 5 часа', '5–6 часа', '7–8 часа', 'Над 8 часа'] },
    { key: 'nutrition', type: 'choice', emoji: '🥗', title: 'Какъв е твоят начин на хранене?', description: 'По-късно ще го използваме за хранителен режим.', options: ['Без специален режим', 'Повече протеин', 'Вегетарианско', 'Нисковъглехидратно'] },
    { key: 'injuries', type: 'choice', emoji: '🩹', title: 'Имаш ли контузии или ограничения?', description: 'Ще избягваме рискови упражнения.', options: ['Нямам контузии', 'Болки в кръста', 'Болки в колене', 'Болки в рамене', 'Друго'] },
    { key: 'ready', type: 'choice', emoji: '🚀', title: 'Профилът ти е готов', description: 'Имаме достатъчно информация за първия план.', options: ['Създай моя план'] },
  ],
};

const en = {
  continue: 'Continue',
  back: 'Back',
  backToPlan: 'Back to plan',
  howToDo: 'How to do it',
  commonMistake: 'Common mistake',
  tapExercise: 'Tap an exercise to see explanation and image.',
  openExercise: 'Tap for explanation and image',
  analyzingTitle: 'Analyzing your profile...',
  analyzingText: 'Creating an individual plan based on your answers.',
  dashboardTitle: 'Your Personal Plan',
  dashboardSubtitle: 'This plan is based on your goal, experience, place and limitations.',
  trainingPlan: 'Training plan',
  mainGoal: 'Main goal',
  trainingPlace: 'Training place',
  daysPerWeek: 'days per week',
  workoutPlanTitle: 'Your individual workout program',
  restart: 'Start again',
  questions: [
    { key: 'name', type: 'input', emoji: '👋', title: 'What is your name?', description: 'We will use your name to personalize your plan.', placeholder: 'Your name' },
    { key: 'gender', type: 'choice', emoji: '🧍', title: 'What is your gender?', description: 'This helps us build a more accurate profile.', options: ['Male', 'Female', 'Prefer not to say'] },
    { key: 'age', type: 'choice', emoji: '🎂', title: 'What is your age range?', description: 'Age helps us adjust intensity.', options: ['18–29', '30–39', '40–49', '50+'] },
    { key: 'height', type: 'input', emoji: '📏', title: 'What is your height?', description: 'Enter your height in centimeters.', placeholder: 'Height in cm', keyboard: 'numeric' },
    { key: 'weight', type: 'input', emoji: '⚖️', title: 'What is your current weight?', description: 'Enter your weight in kilograms.', placeholder: 'Weight in kg', keyboard: 'numeric' },
    { key: 'goal', type: 'choice', emoji: '🎯', title: 'What is your main goal?', description: 'This determines your training style.', options: ['Lose Weight', 'Build Muscle', 'Burn Fat & Build Muscle', 'Maintain Shape'] },
    { key: 'targetWeight', type: 'input', emoji: '🏁', title: 'What is your target weight?', description: 'This helps create a realistic path.', placeholder: 'Target weight in kg', keyboard: 'numeric' },
    { key: 'place', type: 'choice', emoji: '🏋️', title: 'Where will you train?', description: 'We select exercises based on your equipment.', options: ['At Home', 'In the Gym', 'Both Home & Gym'] },
    { key: 'experience', type: 'choice', emoji: '💪', title: 'What is your experience?', description: 'Experience determines difficulty.', options: ['Beginner', 'Intermediate', 'Advanced'] },
    { key: 'days', type: 'choice', emoji: '📅', title: 'How many days per week can you train?', description: 'Choose realistically.', options: ['2 days', '3 days', '4 days', '5 days', '6 days'] },
    { key: 'activity', type: 'choice', emoji: '🔥', title: 'How active are you daily?', description: 'This helps adjust workload.', options: ['Mostly sitting', 'Lightly active', 'Active job', 'Very active'] },
    { key: 'sleep', type: 'choice', emoji: '😴', title: 'How many hours do you sleep?', description: 'Sleep affects recovery.', options: ['Less than 5 hours', '5–6 hours', '7–8 hours', 'More than 8 hours'] },
    { key: 'nutrition', type: 'choice', emoji: '🥗', title: 'What is your nutrition style?', description: 'Later we will use this for meals.', options: ['No specific diet', 'High protein', 'Vegetarian', 'Low carb'] },
    { key: 'injuries', type: 'choice', emoji: '🩹', title: 'Do you have injuries or limitations?', description: 'We will avoid risky exercises.', options: ['No injuries', 'Back pain', 'Knee pain', 'Shoulder pain', 'Other'] },
    { key: 'ready', type: 'choice', emoji: '🚀', title: 'Your profile is ready', description: 'We have enough information for your first plan.', options: ['Create my plan'] },
  ],
};

const EXERCISES: Exercise[] = [
  makeExercise('Лицеви опори', 'Push Ups', 'Постави ръце на пода, тялото е изправено. Спускаш гърдите към пода и избутваш обратно нагоре.', 'Place your hands on the floor, keep your body straight, lower your chest and push back up.', 'Не отпускай кръста надолу и не вдигай таза прекалено високо.', 'Do not let your lower back drop or lift your hips too high.', '💪', 'push', 'home', ['shoulder']),
  makeExercise('Лицеви опори на колене', 'Knee Push Ups', 'Като лицева опора, но коленете са на пода. Това е по-лесен вариант.', 'Like a push up, but with your knees on the floor. This is an easier version.', 'Не сгъвай тялото в кръста. Дръж гърба стегнат.', 'Do not bend at the waist. Keep your back firm.', '💪', 'push_easy', 'home'),
  makeExercise('Лежанка с щанга', 'Bench Press', 'Лягаш на лежанка, държиш щангата и я спускаш контролирано към гърдите, после избутваш нагоре.', 'Lie on a bench, lower the bar toward your chest with control, then press it up.', 'Не пускай щангата рязко и не извивай прекалено кръста.', 'Do not drop the bar quickly and do not overarch your lower back.', '🏋️', 'push', 'gym', ['shoulder']),
  makeExercise('Лежанка с дъмбели', 'Dumbbell Press', 'Лягаш на лежанка и избутваш двата дъмбела нагоре, после ги спускаш контролирано.', 'Lie on a bench and press both dumbbells upward, then lower them with control.', 'Не разтваряй лактите прекалено навън.', 'Do not flare your elbows too far out.', '🏋️', 'push', 'gym', ['shoulder']),
  makeExercise('Вдигане на ръце встрани с дъмбели', 'Lateral Raises', 'Държиш дъмбели до тялото и вдигаш ръцете встрани до височина на раменете.', 'Hold dumbbells by your sides and raise your arms sideways to shoulder height.', 'Не използвай засилка с тялото. Движението трябва да е контролирано.', 'Do not swing your body. The movement should be controlled.', '🏋️', 'shoulders', 'gym', ['shoulder']),
  makeExercise('Избутване над глава с дъмбели', 'Dumbbell Shoulder Press', 'Държиш дъмбели на височина рамене и ги избутваш нагоре над главата.', 'Hold dumbbells at shoulder height and press them overhead.', 'Не извивай кръста назад. Стегни корема.', 'Do not arch your lower back. Keep your core tight.', '🏋️', 'shoulders', 'gym', ['shoulder']),

  makeExercise('Клекове без тежести', 'Bodyweight Squats', 'Застани прав, спусни таза назад и надолу, сякаш сядаш, после се изправи.', 'Stand tall, move your hips back and down as if sitting, then stand up.', 'Не събирай коленете навътре.', 'Do not let your knees collapse inward.', '🦵', 'legs', 'home', ['knee']),
  makeExercise('Сядане и ставане от стол', 'Chair Squats', 'Сядаш леко на стол и ставаш обратно. Подходящо е за начинаещи.', 'Sit lightly on a chair and stand back up. Good for beginners.', 'Не падай рязко върху стола. Контролирай движението.', 'Do not drop quickly onto the chair. Control the movement.', '🪑', 'legs_easy', 'home'),
  makeExercise('Клек с щанга', 'Barbell Squats', 'Щангата е на горната част на гърба. Клякаш контролирано и се изправяш.', 'Place the bar on your upper back, squat down with control and stand up.', 'Не навеждай прекалено гърба напред.', 'Do not lean your back too far forward.', '🏋️', 'legs', 'gym', ['knee', 'back']),
  makeExercise('Лег преса', 'Leg Press', 'Сядаш на машината, поставяш крака на платформата и избутваш с крака.', 'Sit on the machine, place your feet on the platform and push with your legs.', 'Не заключвай коленете напълно горе.', 'Do not fully lock your knees at the top.', '🦵', 'legs', 'gym', ['knee']),
  makeExercise('Повдигане на пръсти за прасци', 'Calf Raises', 'Заставаш прав и се повдигаш на пръсти, после се връщаш бавно надолу.', 'Stand tall, rise onto your toes, then lower slowly.', 'Не прави движението прекалено бързо.', 'Do not perform the movement too quickly.', '🦵', 'calves', 'both'),
  makeExercise('Повдигане на таза от легнало положение', 'Glute Bridges', 'Лягаш по гръб, сгъваш колене и повдигаш таза нагоре, като стягаш седалището.', 'Lie on your back, bend your knees and lift your hips while squeezing your glutes.', 'Не извивай прекалено кръста.', 'Do not overarch your lower back.', '🍑', 'glutes', 'home'),
  makeExercise('Сгъване за задно бедро на машина', 'Leg Curl Machine', 'На машина сгъваш краката назад, за да натовариш задната част на бедрата.', 'Use the machine to curl your legs backward and train the back of the thighs.', 'Не вдигай таза от седалката.', 'Do not lift your hips from the seat.', '🦵', 'glutes', 'gym'),

  makeExercise('Набирания', 'Pull Ups', 'Хващаш лост и издърпваш тялото нагоре, докато брадичката се доближи до лоста.', 'Grab a bar and pull your body up until your chin gets close to the bar.', 'Не се люлей прекалено.', 'Do not swing too much.', '🏋️', 'pull', 'gym'),
  makeExercise('Дърпане на горен скрипец', 'Lat Pulldown', 'Сядаш на машината и дърпаш ръкохватката надолу към горната част на гърдите.', 'Sit on the machine and pull the handle down toward your upper chest.', 'Не дърпай зад врата.', 'Do not pull behind your neck.', '🏋️', 'pull', 'gym'),
  makeExercise('Гребане на скрипец', 'Cable Row', 'Сядаш на машината и дърпаш ръкохватката към корема.', 'Sit on the machine and pull the handle toward your stomach.', 'Не се навеждай рязко назад.', 'Do not lean back aggressively.', '🏋️', 'pull', 'gym', ['back']),
  makeExercise('Дърпане на ластик към корема', 'Band Row', 'Хващаш ластика и го дърпаш към корема, като събираш лопатките назад.', 'Hold the band and pull it toward your stomach while squeezing your shoulder blades.', 'Не повдигай раменете към ушите.', 'Do not shrug your shoulders toward your ears.', '🪢', 'pull', 'home'),
  makeExercise('Сгъване за бицепс', 'Biceps Curl', 'Държиш тежест и сгъваш ръката в лакътя, като повдигаш тежестта нагоре.', 'Hold a weight and bend your elbow to lift it upward.', 'Не използвай засилка с тялото.', 'Do not swing your body.', '💪', 'arms', 'gym'),

  makeExercise('Коремни преси', 'Crunches', 'Лягаш по гръб и повдигаш горната част на тялото към коленете.', 'Lie on your back and lift your upper body toward your knees.', 'Не дърпай врата с ръце.', 'Do not pull your neck with your hands.', '🔥', 'core', 'home'),
  makeExercise('Задържане на тялото на лакти и пръсти', 'Plank Hold', 'Заставаш на лакти и пръсти, тялото е право, коремът е стегнат.', 'Hold your body on elbows and toes, keeping it straight and your core tight.', 'Не отпускай таза надолу.', 'Do not let your hips drop.', '🔥', 'core', 'home', ['shoulder']),
  makeExercise('Повдигане на колене от висене', 'Hanging Knee Raises', 'Висиш на лост и повдигаш коленете към корема.', 'Hang from a bar and raise your knees toward your stomach.', 'Не се люлей силно.', 'Do not swing strongly.', '🔥', 'core', 'gym'),
  makeExercise('Повдигане на колене от легнало положение', 'Lying Knee Raises', 'Лягаш по гръб и повдигаш коленете към корема.', 'Lie on your back and raise your knees toward your stomach.', 'Не отлепяй рязко кръста.', 'Do not lift your lower back suddenly.', '🔥', 'core_easy', 'home'),

  makeExercise('Редуване на колене към гърдите в опора', 'Mountain Climbers', 'Заставаш в позиция като за лицева опора и редуваш коленете към гърдите.', 'Start in a push-up position and alternate bringing your knees toward your chest.', 'Не отпускай кръста надолу.', 'Do not let your lower back drop.', '🏃', 'cardio', 'home', ['knee', 'shoulder']),
  makeExercise('Подскоци с разтваряне на ръце и крака', 'Jumping Jacks', 'Подскачаш, като едновременно разтваряш крака и ръце, после се връщаш обратно.', 'Jump while opening your arms and legs, then return back.', 'Не приземявай твърде силно на петите.', 'Do not land too hard on your heels.', '🏃', 'cardio', 'home', ['knee']),
  makeExercise('Бързо ходене', 'Fast Walk', 'Ходи с бързо темпо, но така че да можеш да дишаш контролирано.', 'Walk at a fast pace while keeping your breathing controlled.', 'Не започвай прекалено бързо.', 'Do not start too fast.', '🚶', 'cardio_easy', 'both'),
  makeExercise('Ходене на пътека под наклон', 'Incline Walk', 'Ходиш на пътека с лек наклон, без да тичаш.', 'Walk on a treadmill with a slight incline, without running.', 'Не се дърпай силно за дръжките.', 'Do not pull strongly on the handles.', '🚶', 'cardio_easy', 'gym'),
  makeExercise('Каране на велоергометър на интервали', 'Bike Intervals', 'Редуваш по-бързо и по-бавно каране на велоергометър.', 'Alternate faster and slower riding on a stationary bike.', 'Не прави всички интервали максимално тежки.', 'Do not make every interval maximum intensity.', '🚴', 'cardio', 'gym', ['knee']),
  makeExercise('Леко каране на велоергометър', 'Easy Bike Ride', 'Караш велоергометър с леко темпо за движение и издръжливост.', 'Ride a stationary bike at an easy pace for movement and endurance.', 'Не настройвай прекалено високо съпротивление.', 'Do not set the resistance too high.', '🚴', 'cardio_easy', 'gym'),
];

function makeExercise(
  bg: string,
  en: string,
  descriptionBg: string,
  descriptionEn: string,
  mistakeBg: string,
  mistakeEn: string,
  image: string,
  category: string,
  equipment: 'home' | 'gym' | 'both',
  avoid?: string[]
): Exercise {
  return { bg, en, descriptionBg, descriptionEn, mistakeBg, mistakeEn, image, category, equipment, avoid };
}

function generateWorkoutPlan(answers: Record<string, string>, language: Language): WorkoutDay[] {
  const days = getDayCount(answers.days);
  const goal = answers.goal || '';
  const place = answers.place || '';
  const experience = answers.experience || '';
  const injury = getInjuryKey(answers.injuries || '');

  const isHome = place.includes('дома') || place.includes('Home');
  const isGym = place.includes('фитнес') || place.includes('Gym');

  const wantsFatLoss =
    goal.includes('Сваляне') ||
    goal.includes('мазнини') ||
    goal.includes('Lose') ||
    goal.includes('Fat');

  const equipment: ('home' | 'gym' | 'both')[] =
    isHome && !isGym
      ? ['home', 'both']
      : isGym && !isHome
        ? ['gym', 'both']
        : ['home', 'gym', 'both'];

  const focuses = buildFocuses(days, wantsFatLoss, language);
  const plan: WorkoutDay[] = [];
  const globalUsedNames = new Set<string>();

  for (let i = 0; i < days; i++) {
    const focus = focuses[i];
    const categories = getCategoriesForFocus(focus.code);
    const usedToday = new Set<string>();

    const exercises = categories.map((category, index) =>
      pickExercise(category, equipment, injury, language, experience, i + index, usedToday, globalUsedNames)
    );

    plan.push({
      day: language === 'bg' ? `Ден ${i + 1}` : `Day ${i + 1}`,
      focus: focus.label,
      exercises,
    });
  }

  return plan;
}

function buildFocuses(days: number, fatLoss: boolean, language: Language) {
  const bgMuscle = [
    { code: 'push', label: 'Гърди, рамене и трицепс' },
    { code: 'pull', label: 'Гръб и бицепс' },
    { code: 'legs', label: 'Крака и седалище' },
    { code: 'core', label: 'Корем и стабилност' },
    { code: 'upper', label: 'Горна част на тялото' },
    { code: 'conditioning', label: 'Издръжливост и движение' },
  ];

  const bgFat = [
    { code: 'full', label: 'Цяло тяло и горене на калории' },
    { code: 'cardio_core', label: 'Кардио и корем' },
    { code: 'legs_light', label: 'Крака и движение' },
    { code: 'upper_light', label: 'Горна част и тонус' },
    { code: 'full_light', label: 'Лека тренировка за цяло тяло' },
    { code: 'conditioning', label: 'Издръжливост' },
  ];

  const enMuscle = [
    { code: 'push', label: 'Chest, Shoulders & Triceps' },
    { code: 'pull', label: 'Back & Biceps' },
    { code: 'legs', label: 'Legs & Glutes' },
    { code: 'core', label: 'Core & Stability' },
    { code: 'upper', label: 'Upper Body' },
    { code: 'conditioning', label: 'Conditioning & Movement' },
  ];

  const enFat = [
    { code: 'full', label: 'Full Body & Calorie Burn' },
    { code: 'cardio_core', label: 'Cardio & Core' },
    { code: 'legs_light', label: 'Legs & Movement' },
    { code: 'upper_light', label: 'Upper Body Tone' },
    { code: 'full_light', label: 'Light Full Body' },
    { code: 'conditioning', label: 'Conditioning' },
  ];

  const list = language === 'bg' ? (fatLoss ? bgFat : bgMuscle) : fatLoss ? enFat : enMuscle;
  return list.slice(0, days);
}

function getCategoriesForFocus(code: string): string[] {
  const map: Record<string, string[]> = {
    push: ['push', 'shoulders', 'core', 'push'],
    pull: ['pull', 'arms', 'core_easy', 'pull'],
    legs: ['legs', 'glutes', 'calves', 'legs'],
    core: ['core', 'core_easy', 'cardio_easy', 'legs'],
    upper: ['push', 'pull', 'shoulders', 'arms'],
    conditioning: ['cardio_easy', 'cardio', 'legs', 'core_easy'],
    full: ['legs', 'push', 'pull', 'cardio_easy'],
    cardio_core: ['cardio', 'core', 'core_easy', 'cardio_easy'],
    legs_light: ['legs', 'glutes', 'cardio_easy', 'core_easy'],
    upper_light: ['push', 'pull', 'arms', 'core_easy'],
    full_light: ['legs', 'push', 'pull', 'cardio_easy'],
  };

  return map[code] || ['legs', 'push', 'pull', 'core'];
}

function pickExercise(
  category: string,
  equipment: ('home' | 'gym' | 'both')[],
  injury: string,
  language: Language,
  experience: string,
  offset: number,
  usedToday: Set<string>,
  globalUsedNames: Set<string>
): PlanExercise {
  let pool = getExercisePool(category, equipment, injury);

  let available = pool.filter((exercise) => {
    const name = language === 'bg' ? exercise.bg : exercise.en;
    return !usedToday.has(name) && !globalUsedNames.has(name);
  });

  if (available.length === 0) {
    available = pool.filter((exercise) => {
      const name = language === 'bg' ? exercise.bg : exercise.en;
      return !usedToday.has(name);
    });
  }

  if (available.length === 0) {
    available = getExercisePool('cardio_easy', equipment, injury);
  }

  const chosen = available[offset % available.length];
  const name = language === 'bg' ? chosen.bg : chosen.en;
  const media = exerciseMedia[name] || exerciseMedia.default;

  usedToday.add(name);
  globalUsedNames.add(name);

  return {
    name,
    sets: getSets(category, experience, language),
    description: language === 'bg' ? chosen.descriptionBg : chosen.descriptionEn,
    mistake: language === 'bg' ? chosen.mistakeBg : chosen.mistakeEn,
    image: chosen.image,
    imageUrl: media?.image,
  };
}

function getExercisePool(
  category: string,
  equipment: ('home' | 'gym' | 'both')[],
  injury: string
): Exercise[] {
  let pool = EXERCISES.filter(
    (exercise) =>
      exercise.category === category &&
      equipment.includes(exercise.equipment) &&
      !(exercise.avoid || []).includes(injury)
  );

  if (pool.length === 0) {
    pool = EXERCISES.filter(
      (exercise) =>
        equipment.includes(exercise.equipment) &&
        !(exercise.avoid || []).includes(injury)
    );
  }

  return pool;
}

function getSets(category: string, experience: string, language: Language): string {
  const isBeginner = experience.includes('Начинаещ') || experience.includes('Beginner');
  const isAdvanced = experience.includes('Напреднал') || experience.includes('Advanced');
  const sets = isBeginner ? 2 : isAdvanced ? 4 : 3;

  if (category.includes('cardio')) {
    return language === 'bg'
      ? `${sets} серии по 30–60 секунди`
      : `${sets} sets x 30–60 sec`;
  }

  if (category.includes('core')) {
    return language === 'bg'
      ? `${sets} серии по 12–20 повторения`
      : `${sets} sets x 12–20 reps`;
  }

  return language === 'bg'
    ? `${sets} серии по 10–15 повторения`
    : `${sets} sets x 10–15 reps`;
}

function getDayCount(days?: string): number {
  const value = days || '';

  if (value.includes('6')) return 6;
  if (value.includes('5')) return 5;
  if (value.includes('4')) return 4;
  if (value.includes('2')) return 2;

  return 3;
}

function getInjuryKey(injury: string): string {
  if (injury.includes('кръста') || injury.includes('Back')) return 'back';
  if (injury.includes('колене') || injury.includes('Knee')) return 'knee';
  if (injury.includes('рамене') || injury.includes('Shoulder')) return 'shoulder';
  return 'none';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000000' },
  container: {
    minHeight: '100%',
    backgroundColor: '#000000',
    padding: 24,
    paddingBottom: 70,
    alignItems: 'center',
  },
  detailContainer: {
    minHeight: '100%',
    backgroundColor: '#000000',
    padding: 24,
    paddingBottom: 70,
    alignItems: 'center',
  },
  backButton: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginBottom: 24,
  },
  backButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  detailImageBox: {
    width: '100%',
    maxWidth: 520,
    height: 260,
    borderRadius: 28,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#242424',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  detailPhoto: { width: '100%', height: '100%' },
  detailImage: { fontSize: 90 },
  detailTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: 520,
    marginBottom: 8,
  },
  detailSets: {
    color: '#0A84FF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#1A1A1A',
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
  },
  detailLabel: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  detailText: { color: '#CCCCCC', fontSize: 16, lineHeight: 24 },
  topRow: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  smallButton: {
    width: 44,
    height: 44,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallButtonText: { color: '#FFFFFF', fontSize: 26 },
  languageButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignSelf: 'flex-end',
  },
  languageText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  progressBackground: {
    width: '100%',
    maxWidth: 520,
    height: 8,
    backgroundColor: '#222222',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: { height: '100%', backgroundColor: '#0A84FF', borderRadius: 20 },
  stepText: { color: '#888888', fontSize: 14, marginBottom: 18 },
  logo: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 22,
    textAlign: 'center',
  },
  imageBox: {
    width: 150,
    height: 150,
    borderRadius: 38,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#242424',
  },
  imageEmoji: { fontSize: 72 },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: 520,
  },
  subtitle: {
    color: '#BBBBBB',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 28,
    maxWidth: 500,
    lineHeight: 23,
  },
  inputArea: { width: '100%', maxWidth: 520 },
  input: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    padding: 17,
    borderRadius: 18,
    marginBottom: 16,
    fontSize: 18,
  },
  optionsArea: { width: '100%', maxWidth: 520 },
  option: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    padding: 19,
    borderRadius: 22,
    marginBottom: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: { backgroundColor: '#0A84FF' },
  optionText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', maxWidth: '85%' },
  circle: { color: '#FFFFFF', fontSize: 22 },
  button: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 10,
  },
  buttonText: { color: '#000000', textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  analysisContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  analysisEmoji: { fontSize: 78, marginBottom: 24 },
  analysisTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  analysisText: {
    color: '#BBBBBB',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 22,
    marginBottom: 30,
  },
  analysisBarBackground: {
    width: '100%',
    maxWidth: 420,
    height: 12,
    backgroundColor: '#222222',
    borderRadius: 20,
    overflow: 'hidden',
  },
  analysisBarFill: { height: '100%', backgroundColor: '#0A84FF', borderRadius: 20 },
  analysisPercent: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  dashboardContainer: {
    minHeight: '100%',
    backgroundColor: '#000000',
    padding: 24,
    paddingBottom: 70,
    alignItems: 'center',
  },
  dashboardTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
  },
  dashboardSubtitle: {
    color: '#BBBBBB',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 28,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#1A1A1A',
    borderRadius: 22,
    padding: 22,
    marginBottom: 14,
  },
  cardLabel: { color: '#AAAAAA', fontSize: 15, marginBottom: 8 },
  cardValue: { color: '#FFFFFF', fontSize: 25, fontWeight: 'bold' },
  workoutTitle: {
    width: '100%',
    maxWidth: 520,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 6,
  },
  tapHint: {
    width: '100%',
    maxWidth: 520,
    color: '#AAAAAA',
    fontSize: 15,
    marginBottom: 16,
  },
  workoutCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#111111',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#242424',
  },
  workoutDay: { color: '#0A84FF', fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  workoutFocus: { color: '#FFFFFF', fontSize: 23, fontWeight: 'bold', marginBottom: 14 },
  exerciseRow: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 14, marginBottom: 10 },
  exerciseName: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  exerciseSets: { color: '#BBBBBB', fontSize: 14 },
  exerciseOpen: { color: '#0A84FF', fontSize: 13, marginTop: 8, fontWeight: 'bold' },
  restartButton: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 18,
  },
  restartButtonText: {
    color: '#000000',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});