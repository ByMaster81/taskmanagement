## (Buradan kopyalamaya başlayın)

# TeamTask API

**TeamTask**, kullanıcıların ve görevlerin yönetildiği, rol tabanlı erişim kontrolüne sahip, modern ve güvenli bir görev yönetimi uygulamasıdır. Bu proje, **Node.js** ve **Express.js** tabanlı bir **RESTful API** ve **WebSockets (Socket.IO)** tabanlı gerçek zamanlı bir mimari üzerine kuruludur. Veri kalıcılığı **PostgreSQL** veritabanı ile sağlanmakta ve tüm veritabanı işlemleri **Prisma ORM** üzerinden yönetilmektedir.

Bu proje, bir backend geliştiricisinin temel yetkinliklerini sergilemek amacıyla oluşturulmuştur: Güvenli API tasarımı (REST & WebSocket), veritabanı yönetimi, kimlik doğrulama, yetkilendirme, gerçek zamanlı iletişim ve modern DevOps pratikleri.

## Temel Özellikler

  - **Kimlik Doğrulama:** `JWT (JSON Web Tokens)` kullanarak güvenli kullanıcı kaydı ve `bcrypt.js` ile hash'lenmiş şifrelerle giriş.
  - **Rol Tabanlı Yetkilendirme (RBAC):**
      - **Admin (`ADMINUSER`):** Tüm kullanıcıları, görevleri ve atamaları yönetebilir (CRUD operasyonları).
      - **Standart Kullanıcı (`USER`):** Sadece kendisine atanmış görevleri görüntüleyebilir.
  - **Gerçek Zamanlı Mesajlaşma:** `Socket.IO` kütüphanesi kullanılarak, JWT ile güvenliği sağlanmış bir WebSocket bağlantısı üzerinden anlık, birebir sohbet. Her kullanıcı, bağlantı anında kendi `userId`'si ile özel bir "oda"ya (`room`) katılır, bu da sunucunun mesajları doğrudan hedeflenen alıcıya iletmesini (`emit`) sağlar.
  - **Kullanıcı Yönetimi:** Adminler `express-validator` ile doğrulanmış verilerle yeni kullanıcılar oluşturabilir, listeleyebilir ve silebilir.
  - **Görev ve Atama Yönetimi:** Adminler yeni görevler oluşturabilir, bu görevleri kullanıcılara atayabilir. Atamaları kaldırabilir, atanan kullanıcıyı değiştirebilir ve görevlerin durumunu (`PENDING`, `IN_PROGRESS`, `DONE`) güncelleyebilir.
  - **Containerization:** Tüm uygulama (Node.js API + PostgreSQL veritabanı) **Docker** ile container haline getirilmiştir.
  - **Veritabanı Yönetimi:** **Prisma ORM** ile tip-güvenli (type-safe) veritabanı işlemleri, şema yönetimi (`migrate`) ve test verisi oluşturma (`seed`).
  - **Vitrinin Arayüzü:** Backend API'sinin yeteneklerini (REST ve WebSocket) test etmek ve sergilemek için **Vanilla JavaScript** ile yazılmış basit, tek sayfalık bir frontend arayüzü içerir.

## Kullanılan Teknolojiler

  - **Backend:** Node.js, Express.js, JWT (jsonwebtoken), Bcrypt.js, Express-validator
  - **Gerçek Zamanlı İletişim:** Socket.IO
  - **Veritabanı:** PostgreSQL, Prisma ORM
  - **Frontend:** Vanilla JavaScript, HTML5
  - **DevOps:** Docker, Docker Compose

## Projeyi Çalıştırma

Bu projenin en güzel yanlarından biri, Docker sayesinde tek bir komutla tüm sistemi (API + Veritabanı) ayağa kaldırabilmenizdir.

**Gereksinimler:**

  - [Docker](https://www.google.com/search?q=https.www.docker.com/get-started)
  - [Docker Compose](https://www.google.com/search?q=https.docs.docker.com/compose/install/)

**Kurulum Adımları:**

1.  **Projeyi klonlayın:**

    ```bash
    git clone https://github.com/ByMaster81/taskmanagement
    cd proje-adi
    ```

2.  **Tüm sistemi başlatın:**
    Projenin ana dizinindeyken aşağıdaki komutu çalıştırın.

    ```bash
    docker-compose up --build
    ```

      - `--build` bayrağı, kodda yaptığınız değişikliklerle Docker imajını yeniden oluşturur.

Bu komut, PostgreSQL veritabanını başlatacak, Node.js uygulamanızın imajını oluşturacak, veritabanı tablolarını (`prisma migrate deploy`) ve test verilerini (`prisma db seed`) oluşturacak ve son olarak sunucuyu başlatacaktır.

3.  **Uygulamaya Erişin:**
    Tarayıcınızdan `http://localhost:3000` adresine gidin.

### Test Kullanıcıları

`seed` script'i tarafından oluşturulan varsayılan kullanıcılarla sisteme giriş yapabilirsiniz:

  - **Admin Girişi:**
      - **E-posta:** `admin@example.com`
      - **Şifre:** `admin123`
  - **Standart Kullanıcı Girişi:**
      - **E-posta:** `user@example.com`
      - **Şifre:** `user123`

## API Mimarisi ve Endpointler

Sistem, işlemlerin çoğunluğu için RESTful HTTP endpointlerini, anlık iletişim için ise WebSocket olaylarını kullanan hibrit bir mimariye sahiptir.

### REST API (HTTP)

Tüm korumalı rotalar `Authorization: Bearer <TOKEN>` başlığı gerektirir.

| Endpoint | Metot | Açıklama | Yetki |
| :--- | :--- | :--- | :--- |
| `/auth/login` | `POST` | Kullanıcı girişi yapar ve JWT döndürür. | Herkese Açık |
| `/users` | `GET` | Tüm kullanıcıları listeler. (`?role=...` filtresi mevcut) | **Admin** |
| `/users` | `POST` | Yeni bir kullanıcı oluşturur. | **Admin** |
| `/users/:id` | `DELETE` | Belirtilen kullanıcıyı ve bağlı tüm kayıtlarını (atamalar, mesajlar) siler. | **Admin** |
| `/tasks` | `POST` | Yeni bir görev oluşturur. | **Admin** |
| `/tasks/:id` | `DELETE` | Bir görevi ve bağlı tüm atamaları siler. | **Admin** |
| `/tasks/:id/status` | `PUT` | Bir görevin durumunu günceller. | **Admin** |
| `/assignments` | `GET` | Tüm atamaları listeler. | **Admin** |
| `/assignments` | `POST` | Bir kullanıcıya görev atar. | **Admin** |
| `/assignments/:id` | `PUT` | Bir atamanın kullanıcısını günceller. | **Admin** |
| `/assignments/:id` | `DELETE` | Bir görev atamasını kaldırır. | **Admin** |
| `/assignments/me` | `GET` | Giriş yapmış kullanıcının kendi görevlerini listeler. | **Giriş Yapmış Kullanıcı** |
| `/messages/:otherUserId` | `GET` | İki kullanıcı arasındaki sohbet **geçmişini** (history) getirir. | **Giriş Yapmış Kullanıcı** |

### Gerçek Zamanlı API (WebSocket)

Anlık mesajlaşma `POST /messages` rotası yerine `Socket.IO` olayları (events) ile yönetilir.

#### 1\. Bağlantı ve Kimlik Doğrulama

Bir istemci (frontend) sunucuya bağlanmak istediğinde, `localStorage`'dan aldığı JWT'yi `auth` seçeneği ile birlikte göndermelidir:

```javascript
// Frontend (app.js)
const socket = io(API_URL, {
  auth: {
    token: authToken
  }
});
```

Backend (`index.js`), `io.use()` ara yazılımını (middleware) kullanarak bu token'ı doğrular. Sadece geçerli bir token'a sahip kullanıcıların WebSocket bağlantısı kurmasına izin verilir.

#### 2\. Oda (Room) Yönetimi

Kimlik doğrulaması başarılı olan her `socket`, `socket.user.id` (token'dan alınan) bilgisi kullanılarak otomatik olarak kendi özel odasına katılır:

```javascript
// Backend (index.js)
socket.join(socket.user.id);
```

Bu, sunucunun `io.to(receiverId).emit(...)` komutuyla, mesajları doğrudan belirli bir kullanıcıya (diğerlerini rahatsız etmeden) iletmesine olanak tanır.

#### 3\. Olaylar (Events)

| Olay Adı | Yön | Veri (Payload) | Açıklama |
| :--- | :--- | :--- | :--- |
| **`sendMessage`** | `Client -> Sunucu` | `{ receiverId, content }` | Sunucuya yeni bir mesaj göndermek için kullanılır. |
| **`receiveMessage`** | `Sunucu -> Client` | `{ id, content, senderId, ... }` | Sunucu, mesajı veritabanına kaydettikten sonra bu olayı hem *alıcıya* hem de *gönderene* (gönderdikleri mesajın onayını görmeleri için) geri iletir. |

## Uygulama Görüntüleri

Aşağıda uygulamanın temel ekranlarına ait görseller yer almaktadır.

-----

### 1\. Giriş Ekranı

*Kullanıcıların sisteme giriş yaptığı ilk ekran.*

-----

### 2\. Admin Yönetim Panosu

*Admin olarak giriş yapıldığında karşılaşılan, tüm yönetim araçlarını ve veri tablolarını barındıran ana kontrol paneli.*

-----

### 3\. Yönetim Araçları (User, Task, Assignment Ekleme)

*Admin panosundaki açılır menüler aracılığıyla yeni kullanıcı, görev ve atama oluşturma formları.*

-----

### 4\. Veri Tabloları

*Admin panosunda, sistemdeki tüm kullanıcıların ve görev atamalarının listelendiği, yönetilebildiği tablolar.*

-----

### 5\. Gerçek Zamanlı Mesajlaşma

*Kullanıcıların Socket.IO üzerinden anlık olarak sohbet ettiği modal ekranı.*
