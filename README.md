## Описание
mmcv_updater - система для автоматического обновления системы анализа видео от компании Innosoft

## Установка
```shell
pip3 install -r requirements.txt
```

## Запуск
```shell
python3 main.py
```
В случае уже запущенного образа, система попытается найти информацию о нём и сохранить данные в файл *update_config.ini*. Если эта операция не удалась, то существует возможность написать собственный файл конфигурации. Для формата обратитесь к примеру конфигурации, поставляющемуся с системой.

## Использование
На данный момент система поддерживает только образы обновлений в виде Docker-образов. Обновление может проходить через веб-интерфейс или путём установки переносного флеш-накопителя с образом в устройство.

##### Получение образа
Для получения образа необходимо выполнить следующую команду на машине с доступом к образу в Docker:
docker save **[название образа]**:**[версия образа]** -o **[название образа]-[версия образа]**.tar<br/>
Где:<br/>
**[название образа]** - название оригинального образа, например mmcv_core_x86, mmcv_trucks_rpi и т.д.<br/>
**[версия образа]** - версия образа в семантическом формате (мажорная.минорная.патч), например 1.7.8, 5.3.2

##### Обновление через веб-интерфейс
Для обновления через веб-интерфейс необходимо подключится к **[ip устройства]/update**,затем:
1. Выбрать образ с обновлением
2. Убедиться, что на устройстве достаточно памяти для загрузки нового образа
3. Загрузить образ

##### Обновление через переносной накопитель
Для обновления через переносной накопитель (флеш-носитель, переносной жёсткий диск) необходимо перенести образ на носитель и затем вставить его в USB-порт устройства. В случае обнаружения более новой версии система установит новый образ
