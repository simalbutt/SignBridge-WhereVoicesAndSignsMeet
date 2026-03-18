import pickle
import os
import cv2
import numpy as np
import string

class SignToTextService:
    def __init__(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, '..', 'character_model.p')
        
        with open(model_path, 'rb') as f:
            self.model_dict = pickle.load(f)
        self.model = self.model_dict['model']
     
        from mediapipe.python.solutions import hands as mp_hands
        self.hands = mp_hands.Hands(static_image_mode=False, min_detection_confidence=0.3)
       
        self.letters = list(string.ascii_uppercase)
        self.labels_dict = {i: letter for i, letter in enumerate(self.letters)}
        self.EXPECTED_LENGTH = 42
        self.BUFFER_SIZE = 15

    def process_single_frame(self, image_path):
        """
        Processes a single JPG frame from the webcam.
        Returns a single character or None.
        """

        frame = cv2.imread(image_path)
        if frame is None:
            return None

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(frame_rgb)

        if results.multi_hand_landmarks:
            hand_landmarks = results.multi_hand_landmarks[0]
     
            x_ = [lm.x for lm in hand_landmarks.landmark]
            y_ = [lm.y for lm in hand_landmarks.landmark]

            data_aux = []
            for lm in hand_landmarks.landmark:
                data_aux.append(lm.x - min(x_))
                data_aux.append(lm.y - min(y_))

            data_aux = data_aux[:self.EXPECTED_LENGTH]
            while len(data_aux) < self.EXPECTED_LENGTH:
                data_aux.append(0)

            prediction = self.model.predict([np.asarray(data_aux)])[0]

            if isinstance(prediction, (int, np.integer)):
                predicted_character = self.labels_dict.get(int(prediction), str(prediction))
            else:
                predicted_character = str(prediction)

            return predicted_character
        
        return None

    def process_video_file(self, video_path):
        cap = cv2.VideoCapture(video_path)
        buffer = []
        sequence = []
        last_appended = None

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.hands.process(frame_rgb)

            predicted_character = 'nothing'
            
            if results.multi_hand_landmarks:
                hand_landmarks = results.multi_hand_landmarks[0]
                x_, y_ = [], []
                for lm in hand_landmarks.landmark:
                    x_.append(lm.x)
                    y_.append(lm.y)

                data_aux = []
                for lm in hand_landmarks.landmark:
                    data_aux.append(lm.x - min(x_))
                    data_aux.append(lm.y - min(y_))

                data_aux = data_aux[:self.EXPECTED_LENGTH]
                while len(data_aux) < self.EXPECTED_LENGTH:
                    data_aux.append(0)

                pred = self.model.predict([np.asarray(data_aux)])[0]
           
                if isinstance(pred, (int, np.integer)):
                    predicted_character = self.labels_dict.get(int(pred), str(pred))
                else:
                    predicted_character = str(pred)

            buffer.append(predicted_character)
            if len(buffer) > self.BUFFER_SIZE:
                buffer.pop(0)

            if buffer.count(buffer[-1]) > self.BUFFER_SIZE // 2:
                stable_label = buffer[-1]
                if stable_label != last_appended:
                    low_label = stable_label.lower()
                    if low_label == 'space':
                        sequence.append(' ')
                    elif low_label != 'nothing' and low_label != 'del':
                        sequence.append(stable_label)
                    elif low_label == 'del' and sequence:
                        sequence.pop()
                    last_appended = stable_label

        cap.release()
        return "".join(sequence)