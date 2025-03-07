# 🐝 Prevention of Mold in Beehives

## 📌 Project Overview  
Mold growth in beehives is a major concern for beekeepers, impacting colony health, reducing honey production, and leading to potential colony collapse. This project presents an **IoT-based system** that integrates **sensors and machine learning** to monitor and regulate hive conditions, preventing mold formation.

---

## 🚀 Features  
✅ **Real-time Monitoring**: Tracks temperature and humidity inside the beehive.  
✅ **Automated Alerts**: Sends notifications when conditions favor mold growth.  
✅ **Data Visualization**: Displays real-time and historical data using interactive charts.  
✅ **Machine Learning Insights**: Predicts mold risks and provides actionable recommendations.  
✅ **Remote Access**: Cloud-based storage ensures data accessibility from anywhere.  

---

## 🛠️ Tech Stack  
### Backend:  
- ![Python](https://img.shields.io/badge/Python-3.9-blue) (Data processing & ML algorithms)  
- ![MongoDB](https://img.shields.io/badge/Database-MongoDB-green) (Sensor data storage)  

### Frontend:  
- ![Next.js](https://img.shields.io/badge/Frontend-Next.js-black) (User interface)  
- ![CSS](https://img.shields.io/badge/Styling-CSS-blue)  
- ![Chart.js](https://img.shields.io/badge/Visualization-Chart.js-red) (Data visualization)  

### IoT & Communication:  
- **MQTT Protocol** (Real-time data transmission)  
- **LoRa868 & Wi-Fi** (Data communication)  

---

## 🎯 System Architecture  
```
[ Sensors ] → [ M5Stack ] → [ LoRa868 ] → [ Cloud Storage (MongoDB) ] → [ Web Dashboard ]
```
1. **Sensors** (Temperature & Humidity) collect data from the hive.  
2. **Data Transmission** via MQTT using LoRa868 to a central device (M5Stack).  
3. **Cloud Storage** (MongoDB) for long-term data retention.  
4. **User Dashboard** displays graphs & alerts using Next.js.  
5. **ML Model** predicts mold risk based on collected data.  

---

## 📸 Screenshots  
<img width="1451" alt="Screenshot 2025-03-07 at 16 42 33" src="https://github.com/user-attachments/assets/0df9442d-4c74-487f-ab3d-229af8036b5e" />
<img width="1320" alt="Screenshot 2025-03-07 at 16 42 52" src="https://github.com/user-attachments/assets/74899e13-532f-42c2-9e4c-1c0500b5ea65" />
<img width="1236" alt="Screenshot 2025-03-07 at 16 48 11" src="https://github.com/user-attachments/assets/bbade806-0742-4f52-af9d-3f7094a80057" />
<img width="1125" alt="Screenshot 2025-03-07 at 16 48 59" src="https://github.com/user-attachments/assets/6e3c9e2f-d08b-4df2-8f73-2dd8d556adf8" />
<img width="1273" alt="Screenshot 2025-03-07 at 16 49 16" src="https://github.com/user-attachments/assets/f8307798-b261-4fd1-a04a-59a8300d005f" />




---

## 📥 Installation & Setup  
-Not Yet-

### 4️⃣ Set up MQTT broker & LoRa868 connectivity.  
### 5️⃣ Connect the sensors and ensure data transmission is active.  

---

## 🧪 Testing  
The system is tested for:  
- ✅ **Data accuracy** (temperature & humidity readings)  
- ✅ **Response time** (sensor-to-dashboard updates)  
- ✅ **ML predictions** (mold risk detection)  
- ✅ **UI functionality** (dashboard & alerts)  

---

## 📌 Future Enhancements  
🚀 Expand ML capabilities for more accurate predictions.  
📱 Implement mobile app support.  
🔋 Improve power efficiency using adaptive energy management.  

---

## 🏆 Contributors  
- **Tamer Amer**  
- **Mbada Shehady**  

---

  
