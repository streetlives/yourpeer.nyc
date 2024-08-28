import Link from "next/link";
import { LOCATION_ROUTE, TERMS_OF_USE_ROUTE } from "../common";
import { TranslatableText } from "../translatable-text";

export function PrivacyPolicyRussianTranslation(){
  return (
    <>
      <section className="bg-white pt-28 lg:pt-32 lg:py-20 notranslate">
        <div className="px-5 max-w-3xl mx-auto">
          <h1 className="text-center font-medium text-2xl lg:text-4xl mb-8">
            Политика конфиденциальности
          </h1>
          <div className="text-base text-dark prose">
            <p className="text-lg text-dark">
              <span>Последнее обновление&nbsp;</span>
              <time dateTime="2023-08-15">15 августа 2023 г</time>
              <span>.</span>
            </p>
            <p>
              <span>
                Настоящая Политика конфиденциальности применяется к Вашему
                доступу и использованию всех продуктов и услуг, которые
                предоставлены через веб-сайт Streetlives, Inc. («Streetlives»),
                расположенный по адресу{" "}
              </span>{" "}
              <Link href="https://yourpeer.nyc">https://yourpeer.nyc</Link>{" "}
              <span>
                («Сайт»). Политика конфиденциальности включена в и на нее
                распространяются{" "}
              </span>
              <Link href={`/${TERMS_OF_USE_ROUTE}`}>
                Условия использования Streetlives
              </Link>{" "}
              <span>
                («Условия»). Термины, написанные с заглавной буквы и не
                определенные в Политике конфиденциальности, имеют значение,
                данное им в Условиях.
              </span>
            </p>
            <p>
              Настоящая Политика конфиденциальности применяется только к
              информации, собранной на Сайте, и не предназначена для полного
              описания политики конфиденциальности Streetlives. В нем
              описывается информация, которую мы получаем от Вас, как мы
              используем и раскрываем Вашу информацию, а также шаги, которые мы
              предпринимаем для защиты вашей информации. Используя Сайт, Вы
              соглашаетесь с правилами конфиденциальности, описанными в
              настоящей Политике.
            </p>

            <h2>Информация, которую мы собираем:</h2>
            <ul>
              <li className="">
                <strong>Личная информация.</strong> <br />
                <p>
                  Как правило, Вы можете посещать Сайт, не сообщая нам, кто Вы,
                  и не раскрывая какую-либо личную информацию (когда мы
                  используем термин «Личная информация», мы подразумеваем
                  информацию, которая может быть связана с конкретным человеком
                  и может быть использована для идентификации этого человека),
                  например, имя, адрес электронной почты, почтовый адрес, номер
                  мобильного телефона, возраст, пол, дата рождения, а также
                  дополнительная конфиденциальная информацая, такая как номер
                  Вашего социального страхования, финансовая информация,
                  информация о финансовом счете и другие подобные типы
                  информации). Если Вы предоставите нам Персональную информацию,
                  мы будем хранить и использовать эту информацию в соответствии
                  с настоящей Политикой. Например, Вы можете предоставить нам
                  Персональную информацию, когда связываетесь с нами или
                  запрашиваете информацию о нас, этом Сайте и наших продуктах
                  или услугах (по электронной почте или другими способами).
                </p>
              </li>
              <li>
                <strong>Информация о файлах cookie</strong> <br />
                <p>
                  Когда Вы используете Сайт, мы можем отправить один или
                  несколько файлов cookie (которые представляют собой небольшие
                  текстовые файлы, содержащие строку буквенно-цифровых символов)
                  на Ваш компьютер или мобильное устройство, чтобы помочь
                  проанализировать поток нашей веб-страницы, настроить наш
                  контент, измерить эффективность рекламы. и способствовать
                  доверию и безопасности. Вы всегда можете отказаться от наших
                  файлов cookie, если Ваш браузер это позволяет, хотя это может
                  помешать Вам использовать Сайт или определенные его функции.
                  Мы также можем использовать Google Analytics или аналогичный
                  сервис, который использует файлы cookie, чтобы помочь нам
                  проанализировать, как пользователи используют Сайт.
                </p>
              </li>
              <li>
                <strong>Автоматически собираемая информация</strong> <br />
                <p>
                  Когда Вы посещаете Сайт, мы можем автоматически получать и
                  записывать определенную информацию с Вашего компьютера,
                  веб-браузера и/или мобильного устройства, включая Ваш IP-адрес
                  или другой адрес или идентификатор устройства, веб-браузер
                  и/или тип устройства, аппаратное обеспечение и настройки и
                  конфигурации программного обеспечения, веб-страницы или сайты,
                  которые Вы посещаете непосредственно перед или сразу после
                  посещения Сайта, страницы, которые Вы просматриваете на Сайте,
                  Ваши действия на Сайте, а также даты и время, когда Вы
                  посещаете, получаете доступ к Сайту или его используете. Когда
                  Вы используете Сайт на мобильном устройстве, мы также можем
                  собирать данные о физическом местонахождении вашего
                  устройства, например, используя сигналы спутника, вышки
                  сотовой связи или сигналов беспроводной локальной сети.
                </p>
              </li>
            </ul>

            <h2>Как мы используем информацию, которую собираем:</h2>
            <ul>
              <li>
                <p>
                  Мы используем неидентифицирующую информацию об использовании
                  Вами Сайта, чтобы понять и проанализировать тенденции
                  использования и предпочтения наших пользователей, улучшить
                  Сайт, а также улучшить обнаружение мошенничества и
                  информационную безопасность.
                </p>
              </li>
              <li>
                <p>
                  Мы можем использовать информацию файлов cookie и автоматически
                  собираемую информацию для: (a) персонализации наших услуг; (b)
                  предоставлять персонализированный контент и информацию; (c)
                  контролировать и анализировать эффективность Сайта; и (d)
                  отслеживать совокупные показатели использования сайта, такие
                  как общее количество посетителей и просмотренных страниц.
                </p>
              </li>
            </ul>

            <h2>Когда мы раскрываем информацию:</h2>
            <ul>
              <li>
                <p>
                  Мы можем раскрыть Вашу информацию, если этого требует закон
                  или если мы добросовестно полагаем, что такие действия
                  необходимы для принятия мер предосторожности против
                  ответственности; для защиты Streetlives от мошеннического,
                  оскорбительного или незаконного использования или
                  деятельности; для защиты безопасности или целостности Сайта;
                  для расследования и защиты от любых претензий или обвинений
                  третьих лиц; оказывать помощь государственным
                  правоохранительным органам; или соблюдать законы штата и
                  федеральные законы в ответ на постановление суда, судебную или
                  иную правительственную повестку или
                </p>
              </li>
              <li>
                <p>
                  В случае, если Streetlives будет участвовать или планирует
                  осуществить продажу, слияние, консолидацию или продажу активов
                  или в маловероятном случае банкротства, Streetlives может
                  передать или уступить данные, включая Персональную информацию,
                  которую мы собрали от пользователей.
                </p>
              </li>
            </ul>

            <h2>Ваш выбор:</h2>
            <ul>
              <li>
                <p>
                  Вы, конечно, можете отказаться предоставлять нам определенную
                  информацию, и в этом случае мы не сможем предоставить Вам
                  некоторые функции и возможности Сайта.
                </p>
              </li>
              <li>
                <p>
                  <span>
                    Поскольку мы можем собирать определенную Персональную
                    информацию, Вы можете запросить доступ, исправление,
                    удаление или ограничение использования определенной
                    Персональной информации, подпадающей под действие настоящей
                    Политики конфиденциальности. Несмотря на то, что Streetlives
                    приложит усилия для удовлетворения Вашего запроса, мы также
                    оставляем за собой право налагать ограничения и требования
                    на такие запросы, если это разрешено или требуется
                    применимым законодательством, и мы не обязаны удовлетворять
                    такой запрос, если только этого не требует применимое
                    законодательство. Обратите внимание, что обработка Вашего
                    запроса также может занять некоторое время. Если у Вас есть
                    вопросы, свяжитесь с нами по адресу
                  </span>
                  <a href="mailto:privacy@streetlives.nyc">
                    privacy@streetlives.nyc
                  </a>
                  <span>.</span>
                </p>
              </li>
            </ul>

            <h2>Наша приверженность конфиденциальности детей:</h2>
            <p>
              Защита частной жизни несовершеннолетних лиц особенно важна. По
              этой причине мы не разрешаем детям до 13 лет использовать Сайт, мы
              сознательно не собираем и не храним информацию от лиц младше 13
              лет, и никакая станица Сайта не предназначена для лиц младше 13
              лет. Если Вы младше 13 лет, пожалуйста, не используйте Сайт и не
              заходите на него ни при каких обстоятельствах. Если мы узнаем, что
              информация была собрана через Сайт от лиц в возрасте до 13 лет и
              без поддающегося проверке согласия родителей, мы предпримем
              соответствующие шаги для удаления этой информации.
            </p>

            <h2>Наша приверженность безопасности данных:</h2>
            <p>
              Мы используем определенные физические, управленческие и
              технические меры безопасности, предназначенные для защиты
              целостности и безопасности Вашей информации; однако никакие меры
              безопасности не являются совершенными или непроницаемыми, поэтому
              мы не можем гарантировать безопасность любой информации, которую
              Вы передаете нам через Сайт, и Вы делаете это на свой страх и
              риск. Мы также не можем гарантировать, что такая информация не
              будет доступна, раскрыта, изменена или уничтожена в результате
              нарушения каких-либо наших физических, технических или
              управленческих мер безопасности. Мы не несем ответственности за
              обход каких-либо настроек конфиденциальности или мер безопасности,
              содержащихся на Сайте.
            </p>
            <p>
              Мы храним информацию до тех пор, пока она необходима и актуальна
              для нашей деятельности и/или для соблюдения закона, предотвращения
              мошенничества, сбора причитающихся комиссий, разрешения споров,
              устранения проблем, оказания помощи в любом расследовании или
              обеспечения соблюдения наших Условий или других соглашений.
            </p>

            <h2>Посетители из-за пределов США:</h2>
            <p>
              Этот Сайт контролируется и управляется компанией Streetlives в
              США. Если Вы решите получить доступ к Сайту из-за пределов
              Соединенных Штатов, Вы признаете, что будете передавать свою
              информацию, включая личную информацию, за пределы этих регионов в
              Соединенные Штаты для хранения и обработки, если это необходимо
              для предоставления Вам продуктов и услуг. доступны через Сайт. При
              необходимости мы соблюдаем применимые правовые нормы, касающиеся
              сбора, хранения, использования и передачи личной информации.
            </p>

            <h2>Ограничение ответственности:</h2>
            <p>
              Заходя на этот Сайт и/или предоставляя нам Персональную информацию
              и другие данные, Вы прямо и безоговорочно освобождаете нас от
              любой ответственности за любые травмы, убытки или ущерб любого
              рода, возникающие в результате или в связи с использованием и /или
              неправильное использование такой информации. Кроме того, хотя мы
              прилагаем усилия для обеспечения надлежащего использования данных
              нашими поставщиками услуг, которые могут получить Вашу информацию
              от нас, мы не несем ответственность за убытки или ущерб любого
              рода, возникающие в результате или в связи с использованием и/или
              неправильным использованием вашей информации со стороны этих
              поставщиков услуг.
            </p>

            <h2>
              Изменения и обновления настоящей Политики конфиденциальности:
            </h2>
            <p>
              Мы оставляем за собой право вносить изменения в настоящую Политику
              конфиденциальности в любое время. Мы будем уведомлять Вас о
              существенных изменениях в том, как мы обрабатываем вашу
              информацию, в том числе путем размещения заметного уведомления на
              Сайте или отправки вам электронного письма, чтобы Вы могли решить,
              продолжать ли использовать Сайт. Существенные изменения вступают в
              силу через 30 календарных дней после нашего первоначального
              уведомления или после принятия вами измененных Условий.
              Несущественные изменения вступают в силу после публикации
              обновленной Политики конфиденциальности или Условий обслуживания
              на Сайте. Пожалуйста, периодически посещайте эту страницу, чтобы
              быть в курсе любых изменений в настоящей Политике
              конфиденциальности. Во избежание сомнений споры, возникающие по
              настоящему Соглашению, будут разрешаться в соответствии с
              Политикой конфиденциальности, действующей на момент возникновения
              спора.
            </p>

            <h2>Не отслеживать раскрытие информации:</h2>
            <p>
              Третьи лица, такие как рекламные сети, поставщики аналитики и
              поставщики виджетов, могут собирать информацию о ваших действиях в
              Интернете с течением времени и на разных веб-сайтах, когда вы
              получаете доступ к нашим Сервисам или используете их. В настоящее
              время различные браузеры предлагают опцию «Не отслеживать», но не
              существует стандарта того, как DNT должен работать на коммерческих
              веб-сайтах. Из-за отсутствия таких стандартов Сайт не реагирует на
              настройки потребительского браузера «Не отслеживать».
            </p>

            <h2>Наша контактная информация:</h2>
            <p>
              <span>
                Пожалуйста, свяжитесь с нами с любыми вопросами или
                комментариями относительно настоящей Политики
                конфиденциальности, вашей личной информации, наших методов
                использования и раскрытия информации или вашего согласия по
                электронной почте по адресу
              </span>{" "}
              <a href="mailto:privacy@streetlives.nyc">
                privacy@streetlives.nyc
              </a>
              <span>.</span>
            </p>
            <address>
              <span>Внимание: Конфиденциальность</span>
              <br />
              <span>Streetlives, Inc.</span>
              <br />
              <span>251 Little Falls Drive</span>
              <br />
              <span>Wilmington, DE 19808</span>
            </address>
          </div>
        </div>
      </section>
      <section className="py-12 bg-neutral-50">
        <div className="px-5 max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center">
            <img
              src="/img/icons/unity-icon.svg"
              className="w-28 mx-auto object-contain mb-10"
              alt=""
            />
            <h2 className="text-4xl text-dark mb-10 text-center font-light">
              You’re not alone in this journey
            </h2>
            <p className="text-center text-gray-800 text-sm px-2 mb-5">
              People rely on social services for many reasons. Our information
              specialists all have lived experiences navigating the support
              system and apply their knowledge collecting the information you
              find here. We’re building YourPeer so it&apos;s easier for you to
              find the right service.
            </p>
            <div>
              <Link href={`/${LOCATION_ROUTE}`} className="primary-button">
                <TranslatableText text="Explore services"/>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}