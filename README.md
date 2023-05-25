# crop-map-on-tiles

Инструмент для разбиения изображений на тайлы.

## Принцип работы

**Для работы неоьходимо установить node.js 18 версии или старшее!**

1. Установите зависимости с помощью пакетного менеджера yarn

   ```bash
   yarn install
   ```

2. Загрузите необходимое изображения, которое собираетесь разбивать на тайлы в папку `assets` и укажите относительный путь до него в файле `.env` в переменной `IMG_PATH`.

   Пример для файла `map.png`:

   ```dotenv
   IMG_PATH="./assets/map.png"
   ...
   ```

3. Запустите утилиту из терминала командой
   ```bash
   yarn start
   ```
4. После выполнения обработки, заберите готовые файлы из папки `tiles`, где папки с номера в название будут маштабами, а файлы тайлов получат названия в формате `tile-{Значение по Оси X}-{Значение по Оси Y}.png`
