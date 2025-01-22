export default function ReviewForm() {
  return (
    <form
      action="#"
      className="bg-white h-full relative overflow-y-hidden pt-2 px-5"
    >
      <div className="pb-12">
        <div className="p-4 rounded-lg bg-indigo-100">
          <h3 className="mb-3 text-base text-[#3D5AFE]">
            A safe space to voice your opinions
          </h3>
          <p className="text-sm">
            Please give us your honest feedback so we can help providers
            improve. Your feedback will be shared anonymously to protect your
            identity.
          </p>
        </div>

        <div className="mt-6">
          <label
            htmlFor="whatWentWell"
            className="mb-2 text-black font-semibold block w-full"
          >
            What went well?
          </label>

          <textarea
            className="text-black text-sm placeholder:text-gray-500 rounded-md border-gray-400 w-full resize-none"
            name="whatWentWell"
            id=""
            rows={5}
            placeholder="What did you like about your experience?"
          ></textarea>
        </div>

        <div className="mt-6">
          <label
            htmlFor="whatWentWell"
            className="mb-2 text-black font-semibold block w-full"
          >
            What could be improved?
          </label>

          <textarea
            className="text-black text-sm placeholder:text-gray-500 rounded-md border-gray-400 w-full resize-none"
            name="whatCouldBeImproved"
            id=""
            rows={5}
            placeholder="How can they do a better job?"
          ></textarea>
        </div>
      </div>

      <div className=" absolute bottom-0 w-full inset-x-0 bg-transparent px-5 py-2">
        <button
          type="submit"
          className="block w-full text-center py-3 px-5 font-semibold text-white bg-[#323232] rounded hover:brightness-110 transition"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
