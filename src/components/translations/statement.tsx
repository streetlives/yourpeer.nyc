import { YouAreNotAlone } from "../you-are-not-alone";

export function StatementRussianTranslation() {
  const governingLawInternalLinkId = "governing_law_footnote";
  return (
    <>
      <section className="bg-white pt-28 lg:pt-32 lg:py-20">
        <div className="px-5 max-w-3xl mx-auto">
          <h1 className="text-center font-medium text-2xl lg:text-4xl mb-8">
            Streetlives: Стараемся Вам помочь
          </h1>
          <div className="text-base prose prose-a:text-blue">
            <p>
              В Streetlives мы верим, что каждый заслуживает доступа к ресурсам,
              поддерживающим его благополучие, независимо от происхождения или
              иммиграционного статуса.
            </p>
            <h2 className="text-xl font-semibold mt-6">Кто мы</h2>
            <ul className="list-disc list-inside">
              <li>
                Разнообразная команда с личным опытом бездомности и иммиграции.
              </li>
              <li>
                Среди нас — беженцы, люди разных национальностей, полов и
                ориентаций.
              </li>
              <li>
                Наш личный опыт помогает нам понимать проблемы людей, ищущих
                поддержку.
              </li>
            </ul>
            <h2 className="text-xl font-semibold mt-6">Что мы предлагаем</h2>
            <ul className="list-disc list-inside ml-4">
              <li>
                Наша платформа, основанная на поддержке равных, с актуальной
                информацией о социальных услугах в Нью-Йорке.
                <ul className="list-[circle] list-inside ml-4">
                  <li>Одежда</li>
                  <li>Образование</li>
                  <li>Трудоустройство</li>
                  <li>Еда</li>
                  <li>Жилищная поддержка</li>
                  <li>Юридическая помощь</li>
                  <li>Медицинская помощь</li>
                  <li>Ресурсы по психическому здоровью</li>
                </ul>
              </li>
            </ul>
            <h2 className="text-xl font-semibold mt-6">
              Как мы вас поддерживаем
            </h2>
            <ul className="list-disc list-inside">
              <li>
                Мы указываем требования к получению услуг, чтобы Вы знали, чего
                ожидать.
              </li>
              <li>
                Мы обеспечиваем Вашу конфиденциальность, никогда не собирая
                личные данные.
              </li>
              <li>
                Мы предлагаем языковую поддержку для тех, кому сложно с
                английским.
              </li>
            </ul>
            <h2 className="text-xl font-semibold mt-6 bg-yellow-100 p-3 rounded-md">
              Наша приверженность в неопределенные времена
            </h2>
            <div className="bg-yellow-100 p-3 rounded-md">
              <ul className="list-disc list-inside">
                <li>
                  С изменением политики в отношении репродуктивных прав,
                  гендерной идентификации и иммиграции многие испытывают страх и
                  неопределенность, особенно те, у кого нет документов и кто
                  может столкнуться с миграционными службами.
                </li>
                <li>
                  Несмотря на эти вызовы, наша преданность Вам остается
                  неизменной.
                </li>
              </ul>
            </div>
            <h2 className="text-xl font-semibold mt-6">Свяжитесь с нами</h2>
            <ul className="list-disc list-inside">
              <li>Спасибо, что поддерживаете нас.</li>
              <li>
                У вас есть предложения или вопросы? Пишите нам на{" "}
                <a
                  href="mailto:team@streetlives.nyc"
                  className="text-blue-600 underline"
                >
                  team@streetlives.nyc
                </a>
                .
              </li>
            </ul>
            <p className="mt-4 font-semibold">
              Мы здесь, чтобы помочь Вам найти нужные ресурсы — в любое время.
            </p>
          </div>
        </div>
      </section>
      <YouAreNotAlone />
    </>
  );
}
